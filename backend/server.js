const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { HfInference } = require("@huggingface/inference");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const { Together } = require("together-ai");
const multer = require("multer");
const hfApi = process.env.HF_API;

// Use your DevInterview Mongoose model (create one as needed)
const DevInterview = require("./models/TCFSpeaking");

const together = new Together();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Configure Gradio Client loader
let Client;
async function loadGradioClient() {
  if (!Client) {
    const gradioModule = await import("@gradio/client");
    Client = gradioModule.Client;
  }
}

/**
 * Route: /generate-feedback
 * Generates feedback for the software developer interview answer.
 */
app.post("/generate-feedback", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      model: "meta-llama/Llama-Vision-Free",
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      stream: true
    });
    let feedback = "";
    for await (const token of response) {
      feedback += token.choices[0]?.delta?.content;
    }
    // Replace newlines with <br> for HTML formatting if needed.
    res.json({ feedback: feedback.replace(/\n/g, "<br>") });
  } catch (error) {
    console.error("Error with Together AI API:", error);
    res.status(500).json({ error: "Failed to generate feedback." });
  }
});

/**
 * Endpoint: /api/initial-question
 * Expects { topic, questionNumber } in the request body.
 * Looks up the main interview question for the given topic and question number from DevInterview,
 * prepends context, converts it to speech using MELoTTS, and returns both text and audio.
 */
app.post("/api/initial-question", async (req, res) => {
  try {
    const { topic, questionNumber } = req.body;
    if (!topic || !questionNumber) {
      return res.status(400).json({ error: "Topic and questionNumber are required." });
    }
    const interviewTopic = await DevInterview.findOne({ topic: topic });
    if (!interviewTopic) {
      return res.status(404).json({ error: "Topic not found." });
    }
    let question;
    let fullQuestion;
    if (questionNumber === 1) {
      question = interviewTopic.mainQuestion1;
      fullQuestion = `You have chosen the "${topic}" developer position. ${question}`;
    } else if (questionNumber === 2) {
      question = interviewTopic.mainQuestion2;
      fullQuestion = `Next question for the "${topic}" developer role. ${question}`;
    } else if (questionNumber === 3) {
      question = interviewTopic.mainQuestion3;
      fullQuestion = `Next question for the "${topic}" developer role. ${question}`;
    } else {
      return res.status(400).json({ error: "Invalid question number." });
    }
    // Use MELoTTS via Gradio Client for TTS (English language)
    await loadGradioClient();
    const melottsClient = await Client.connect("mrfakename/MeloTTS");
    const speakers = await melottsClient.predict("/load_speakers", {
      language: "EN",
      text: "Hello!"
    });
    if (!speakers || speakers.length === 0) {
      throw new Error("No valid speakers found for MELoTTS.");
    }
    const selectedSpeaker = speakers.data[0]?.value;
    if (!selectedSpeaker) {
      throw new Error("No valid speakers found for MELoTTS.");
    }
    const ttsResponse = await melottsClient.predict("/synthesize", {
      text: fullQuestion,
      speaker: selectedSpeaker,
      speed: 1,
      language: "EN"
    });
    res.json({ question: fullQuestion, audio: ttsResponse });
  } catch (error) {
    console.error("Error in initial question:", error);
    res.status(500).json({ error: "Failed to generate initial question." });
  }
});

/**
 * Endpoint: /api/speech-to-text
 * Expects an audio file upload and converts the speech to text.
 */
app.post("/api/speech-to-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    if (!req.file.mimetype.includes("audio")) {
      return res.status(400).json({ error: "Invalid file type. Please upload an audio file." });
    }
    const client = new HfInference(hfApi);
    const audioBuffer = req.file.buffer;
    const result = await client.automaticSpeechRecognition({
      data: audioBuffer,
      model: "openai/whisper-large-v3-turbo",
      language: "en"
    });
    if (result.text) {
      res.json({ text: result.text });
    } else {
      res.status(500).json({ error: "Failed to transcribe audio." });
    }
  } catch (error) {
    console.error("Error with Hugging Face API:", error);
    res.status(500).json({ error: "Failed to process the audio." });
  }
});

/**
 * Endpoint: /api/ai-response-to-speech
 * Expects { prompt, topic, questionNumber, followupCount }.
 * Constructs a prompt that provides concise technical feedback and always ends with a follow-up question.
 * The prompt is tailored for a software developer interview.
 */
app.post("/api/ai-response-to-speech", async (req, res) => {
  try {
    const { prompt, topic, questionNumber, followupCount } = req.body;
    // Determine difficulty level based on followupCount
    let difficulty;
    if (followupCount <= 3) {
      difficulty = "basic";
    } else if (followupCount <= 6) {
      difficulty = "intermediate";
    } else {
      difficulty = "advanced";
    }
    
    // Change the prompt based on followupCount: include follow-up question when followupCount < 2,
    // otherwise just end the current question with feedback.
    let feedbackPrompt = "";
    if (followupCount < 2) {
      feedbackPrompt = `You are a technical interviewer for a software developer role.
The topic is: "${topic}". For the candidate's answer: "${prompt}",
provide concise feedback in at most two sentences without mentioning if the answer is vague.
Always end with a follow-up technical question related to this topic.
The difficulty level is ${difficulty}.`;
    } else {
      feedbackPrompt = `You are a technical interviewer for a software developer role.
The topic is: "${topic}". For the candidate's answer: "${prompt}",
provide concise feedback in at most two sentences that comprehensively concludes the current question,
without including any follow-up technical question.
The difficulty level is ${difficulty}.`;
    }

    await loadGradioClient();
    const response = await together.chat.completions.create({
      messages: [{ role: "system", content: feedbackPrompt }],
      model: "meta-llama/Llama-Vision-Free",
      max_tokens: 200,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      stream: true,
    });
    let feedback = "";
    for await (const token of response) {
      feedback += token.choices[0]?.delta?.content;
    }
    const aiText = feedback.replace(/\n/g, " ...").replace(/undefined/g, "").trim();
    if (!aiText) {
      throw new Error("AI generated an invalid response.");
    }
    // Optionally, scoring logic for the candidate can be added here.
    const client = await Client.connect("mrfakename/MeloTTS");
    const speakers = await client.predict("/load_speakers", {
      language: "EN",
      text: "Hello!"
    });
    if (!speakers || speakers.length === 0) {
      throw new Error("No valid speakers found for MELoTTS.");
    }
    const selectedSpeaker = speakers.data[0]?.value;
    if (!selectedSpeaker) {
      throw new Error("No valid speakers found for MELoTTS.");
    }
    const ttsResponse = await client.predict("/synthesize", {
      text: aiText,
      speaker: selectedSpeaker,
      speed: 1,
      language: "EN"
    });
    console.log("Converting audio response...");
    res.json({ response: aiText, audio: ttsResponse });
  } catch (error) {
    console.error("Error with MELoTTS API:", error);
    res.status(500).json({ error: "Failed to generate AI speech." });
  }
});

// ---------- GraphQL Setup ----------

// Load and merge GraphQL schema files from the ./schema directory.
const typesArray = loadFilesSync(path.join(__dirname, "./schema"), {
  extensions: ["graphql"]
});
const typeDefs = mergeTypeDefs(typesArray);

// Start Apollo Server with resolvers from "./resolvers/resolvers"
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers: require("./resolvers/resolvers")
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;

  let isConnected;
  async function connectToDatabase() {
    if (isConnected) return;
    try {
      const db = await mongoose.connect(process.env.MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        serverSelectionTimeoutMS: 5000
      });
      isConnected = db.connections[0].readyState;
      console.log("Connected to MongoDB successfully!");
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    }
  }
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => console.log(err));
