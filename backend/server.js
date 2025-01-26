const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { HfInference } = require("@huggingface/inference");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");

const hfApi = process.env.HF_API;

// Initialize Express app
const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({}));

// Load and merge GraphQL schema files
const typesArray = loadFilesSync(path.join(__dirname, "./schema"), {
  extensions: ["graphql"]
});
const typeDefs = mergeTypeDefs(typesArray);

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route for generating feedback
app.post("/generate-feedback", async (req, res) => {
  try {
    const { prompt } = req.body;
    const client = new HfInference(hfApi);
    const chatCompletion = await client.chatCompletion({
      //model: "Qwen/QwQ-32B-Preview",
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    });
    res.json({ feedback: chatCompletion.choices[0].message.content.replace(/\n/g, "<br>") });
  } catch (error) {
    console.error("Error with Hugging Face API:", error);
    res.status(500).json({ error: "Failed to generate feedback." });
  }
});

// Route to handle speech-to-text
app.post("/api/speech-to-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const client = new HfInference(hfApi);
    const audioBuffer = req.file.buffer;

    // Ensure the buffer is a valid WAV file
    if (!req.file.mimetype.includes("audio")) {
      return res.status(400).json({ error: "Invalid file type. Please upload an audio file." });
    }

    const result = await client.automaticSpeechRecognition({
      data: audioBuffer,
      model: "facebook/wav2vec2-base-960h",
    });

    if (result.text) {
      res.json({ transcription: result.text });
    } else {
      res.status(500).json({ error: "Failed to transcribe audio." });
    }
  } catch (error) {
    console.error("Error with Hugging Face API:", error);
    res.status(500).json({ error: "Failed to process the audio." });
  }
});


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
        serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds if connection fails
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

// // Export the app for AWS Lambda
// module.exports = app;
