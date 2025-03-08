import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ReactMic } from "react-mic";
import LoadingSpinner from "./LoadingSpinner";

// Exam image logic
const getExamImage = (topic) => {
  const lower = topic.toLowerCase();
  if (lower.includes("artificial intelligence")) {
    return "https://anmj.org.au/wp-content/uploads/2024/04/AIWEB.jpg";
  } else if (lower.includes("neural networks")) {
    return "https://www.imsl.com/sites/default/files/image/2021-01/social-blog-neural-networks-november.jpg";
  } else if (lower.includes("data engineering")) {
    return "https://cdn.prod.website-files.com/64fef88ee8b22d3d21b715a2/657c2bfd9d07f76a47c70ce8_64c0dfda42c1ee625bb4640c_Blog%2520image%2520(1).webp";
  } else if (lower.includes(".net/c#/sql")) {
    return "https://xpertsolutions-it.com/wp-content/uploads/2018/02/csharpWinformBasico.png";
  } else if (lower.includes("reactjs")) {
    return "https://knackforge.com/wp-content/uploads/2022/11/Benefits-of-ReactJS.jpg";
  } else if (lower.includes("google sde ii")) {
    return "https://miro.medium.com/v2/resize:fit:8064/1*XSyMoN8ZmfnfZZgELXGo_Q.jpeg";
  }
  return "https://www.globaltimes.cn/Portals/0/attachment/2022/2022-09-16/913af628-a364-4f82-8bc3-2bfc27f19699.jpeg";
};

const frenchBlue = "#0055A4";
const frenchRed = "#EF4135";
const frenchWhite = "#FFFFFF";

// Scoring function
const calculateScore = (userResponses) => {
  const total = Object.values(userResponses).reduce((sum, resp) => sum + 3, 0);
  return Math.round((total / 27) * 10);
};

const Speech = () => {
  const [allExams, setAllExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  // currentMainQuestion: 1 means DB question from mainQuestion1, etc.
  const [currentMainQuestion, setCurrentMainQuestion] = useState(1);
  const currentMainQuestionRef = useRef(1);
  const [followupCount, setFollowupCount] = useState(0);
  const followupCountRef = useRef(0);

  // userResponses: store user answers by overall question index
  const [userResponses, setUserResponses] = useState({});
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Final result state
  const [finalScore, setFinalScore] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState("");

  const [recording, setRecording] = useState(false);
  const [lastPlayedAudioId, setLastPlayedAudioId] = useState(null);
  const audioRef = useRef(null);

  // overallQuestionIndex = (currentMainQuestion - 1) * 3 + followupCount + 1
  const overallQuestionIndex =
    (currentMainQuestionRef.current - 1) * 3 + followupCountRef.current + 1;

  // Fetch speaking exams from GraphQL
  useEffect(() => {
    const fetchAllTCFSpeakings = async () => {
      const query = `
        query GetAllTCFSpeakings {
          tcfSpeakings {
            id
            topic
            mainQuestion1
            mainQuestion2
            mainQuestion3
          }
        }
      `;
      try {
        const res = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const result = await res.json();
        setAllExams(result.data.tcfSpeakings);
      } catch (error) {
        console.error("Error fetching speaking exams:", error);
      }
    };
    fetchAllTCFSpeakings();
  }, []);

  // Handle exam selection
  const handleExamSelection = (examId) => {
    const exam = allExams.find((e) => e.id === examId);
    setSelectedExam(exam);
    setConversationHistory([]);
    setCurrentMainQuestion(1);
    setFollowupCount(0);
    followupCountRef.current = 0;
    currentMainQuestionRef.current = 1;
    setUserResponses({});
    setFinalScore(null);
    setFinalFeedback("");
  };

  // Auto-play latest AI audio using hidden <audio>
  useEffect(() => {
    const latestAIMessage = conversationHistory
      .filter((msg) => msg.role === "ai" && msg.audio)
      .slice(-1)[0];

    if (latestAIMessage && latestAIMessage.id !== lastPlayedAudioId && audioRef.current) {
      // If audio is already playing, don't interrupt it.
      if (!audioRef.current.paused) return;

      audioRef.current.src = latestAIMessage.audio;
      audioRef.current
        .play()
        .then(() => setLastPlayedAudioId(latestAIMessage.id))
        .catch((err) => console.warn("Auto-play failed:", err));
    }
  }, [conversationHistory, lastPlayedAudioId]);

  // Attach audio "ended" event listener only once
  useEffect(() => {
    const audioElement = audioRef.current;

    const handleAudioEnded = async () => {
      // Determine if the latest AI audio was an evaluation response.
      const latestAIMessage = conversationHistory
        .filter((msg) => msg.role === "ai" && msg.audio)
        .slice(-1)[0];

      if (followupCountRef.current >= 3) {
        console.log("Final question completed", followupCountRef.current);
        if (currentMainQuestionRef.current < 3) {
          console.log("Moving to next main question", currentMainQuestionRef.current);
          currentMainQuestionRef.current += 1;
          followupCountRef.current = 0;
          setFollowupCount(0);
          await fetchDBQuestion(currentMainQuestionRef.current);
        } else {
          handleFinishTest(); // Final question completed
        }
      }
    };

    if (audioElement) {
      audioElement.addEventListener("ended", handleAudioEnded);
    }
    return () => {
      if (audioElement) audioElement.removeEventListener("ended", handleAudioEnded);
    };
    // Empty dependency array so the listener is attached only once.
  }, []);

  // Fetch DB question from TCFSpeaking given mainQuestion number
  const fetchDBQuestion = async (mainQNumber) => {
    console.log("Fetching DB question for mainQNumber:", mainQNumber);
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/initial-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedExam.topic, questionNumber: mainQNumber }),
      });
      const data = await res.json();
      if (
        data.question &&
        data.audio &&
        data.audio.data &&
        data.audio.data.length > 0 &&
        data.audio.data[0].url
      ) {
        const audioUrl = data.audio.data[0].url;
        const aiMessage = {
          id: Date.now(),
          role: "ai",
          text: data.question,
          audio: audioUrl,
        };
        setConversationHistory((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("Error fetching DB question:", err);
    }
    setIsLoading(false);
  };

  // Start Conversation Screen
  if (selectedExam && conversationHistory.length === 0) {
    return (
      <div
        className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center"
        style={{
          background: `linear-gradient(135deg, ${frenchBlue} 40%, ${frenchWhite} 100%)`,
          padding: "2rem",
        }}
      >
        <div
          className="card shadow-lg p-4 mb-5"
          style={{
            maxWidth: "800px",
            width: "100%",
            border: `1px solid ${frenchBlue}`,
          }}
        >
          <div className="mb-3 text-start">
            <button
              className="btn"
              style={{
                backgroundColor: frenchBlue,
                color: frenchWhite,
                marginRight: "1rem",
              }}
              onClick={() => setSelectedExam(null)}
            >
              Back to Exam Selection
            </button>
          </div>

          <h2 className="text-center mb-4" style={{ fontWeight: "700", color: frenchBlue }}>
            🎙 Frenchify - Speak & Learn
          </h2>

          <h4 className="text-center mb-4" style={{ color: frenchRed }}>
            Topic: {selectedExam.topic}
          </h4>

          {isLoading && (
            <div className="text-center my-3">
              <LoadingSpinner />
            </div>
          )}

          <div className="text-center mb-4">
            {/* For Q1 (DB question) */}
            <button
              className="btn"
              style={{
                backgroundColor: frenchRed,
                color: frenchWhite,
                padding: "0.75rem 1.5rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                borderRadius: "0.3rem",
              }}
              onClick={() => {
                setFollowupCount(0);
                followupCountRef.current = 0;
                currentMainQuestionRef.current = 1;
                fetchDBQuestion(1); // Q1 from DB
              }}
            >
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Start & Stop Recording
  const startRecording = () => setRecording(true);
  const stopRecording = () => setRecording(false);

  // onStop: Transcribe + AI Evaluation Follow-up
  const onStop = async (recordedBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", recordedBlob.blob);

      const speechResponse = await fetch("http://localhost:4000/api/speech-to-text", {
        method: "POST",
        body: formData,
      });
      const data = await speechResponse.json();

      if (data.text) {
        // Save user response
        const userMessage = {
          id: Date.now(),
          role: "user",
          text: data.text,
          audio: null,
        };
        setConversationHistory((prev) => [...prev, userMessage]);

        // Get AI evaluation after user answer
        const aiResponseRes = await fetch("http://localhost:4000/api/ai-response-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: data.text,
            topic: selectedExam.topic,
            questionNumber: currentMainQuestionRef.current,
            followupCount: followupCountRef.current,
          }),
        });
        const aiData = await aiResponseRes.json();

        if (aiData.response && aiData.audio?.data?.[0]?.url) {
          const aiMessage = {
            id: Date.now() + 1,
            role: "ai",
            text: aiData.response,
            audio: aiData.audio.data[0].url,
          };
          setConversationHistory((prev) => [...prev, aiMessage]);

          // Update followup count
          console.log("Followup count increasing:", followupCountRef.current);
          followupCountRef.current += 1;
          setFollowupCount(followupCountRef.current);
        } else {
          setConversationHistory((prev) => [
            ...prev,
            { id: Date.now(), role: "ai", text: "Sorry, I couldn't evaluate that.", audio: null },
          ]);
        }
      } else {
        setConversationHistory((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", text: "Couldn't understand audio.", audio: null },
        ]);
      }
    } catch (error) {
      console.error("Error processing speech:", error);
    }
    setIsLoading(false);
  };

  // handleFinishTest: When on final question
  const handleFinishTest = () => {
    const score = calculateScore(userResponses);
    setFinalScore(score);
    setFinalFeedback("Final Feedback: " + JSON.stringify(userResponses));
    // Optionally, save the user score to your database here.
  };

  // Exam selection screen if no exam is selected
  if (!selectedExam) {
    return (
      <div className="container my-5">
        <h2 className="mb-5 text-center" style={{ color: frenchRed }}>
          Select a TCF Speaking Exam
        </h2>
        <div className="row">
          {allExams && allExams.length > 0 ? (
            allExams.map((exam) => (
              <div key={exam.id} className="col-md-4 mb-4">
                <div
                  className="card h-100 shadow"
                  style={{ cursor: "pointer", transition: "transform 0.2s" }}
                  onClick={() => handleExamSelection(exam.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <img
                    src={getExamImage(exam.topic)}
                    className="card-img-top"
                    alt="Speaking Exam"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h4 className="card-title">{exam.topic}</h4>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No speaking exams available</p>
          )}
        </div>
      </div>
    );
  }

  // Start Conversation Screen (again) if exam is selected but conversation hasn't started
  if (selectedExam && conversationHistory.length === 0) {
    return (
      <div
        className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center"
        style={{
          background: `linear-gradient(135deg, ${frenchBlue} 40%, ${frenchWhite} 100%)`,
          padding: "2rem",
        }}
      >
        <div
          className="card shadow-lg p-4 mb-5"
          style={{ maxWidth: "800px", width: "100%", border: `1px solid ${frenchBlue}` }}
        >
          <div className="mb-3 text-start">
            <button
              className="btn"
              style={{ backgroundColor: frenchBlue, color: frenchWhite, marginRight: "1rem" }}
              onClick={() => setSelectedExam(null)}
            >
              Back to Exam Selection
            </button>
          </div>

          <h2 className="text-center mb-4" style={{ fontWeight: "700", color: frenchBlue }}>
            🎙 Frenchify - Speak & Learn
          </h2>

          <h4 className="text-center mb-4" style={{ color: frenchRed }}>
            Topic: {selectedExam.topic}
          </h4>

          {isLoading && (
            <div className="text-center my-3">
              <LoadingSpinner />
            </div>
          )}

          <div className="text-center mb-4">
            <button
              className="btn"
              style={{
                backgroundColor: frenchRed,
                color: frenchWhite,
                padding: "0.75rem 1.5rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                borderRadius: "0.3rem",
              }}
              onClick={() => {
                setFollowupCount(0);
                followupCountRef.current = 0;
                currentMainQuestionRef.current = 1;
                fetchDBQuestion(1); // Q1 from DB
              }}
            >
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main conversation UI
  return (
    <div className="container my-5">
      {isLoading && <LoadingSpinner />}
      <div className="mb-4">
        <button
          className="btn"
          style={{ backgroundColor: frenchBlue, color: frenchWhite, marginRight: "1rem" }}
          onClick={() => setSelectedExam(null)}
        >
          Back to Exam Selection
        </button>
      </div>
      <h2 className="text-center mb-4" style={{ color: frenchBlue }}>
        Speaking Exam: {selectedExam.topic}
      </h2>
      <div className="chat-container mb-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
        {conversationHistory.length > 0 &&
          conversationHistory
            .slice()
            .reverse()
            .map((msg) => (
              <div
                key={msg.id}
                className="card mb-3"
                style={{
                  backgroundColor: msg.role === "user" ? "#e6f7ff" : "#f1f1f1",
                  border: msg.role === "user" ? `2px solid ${frenchBlue}` : "1px solid #ccc",
                  padding: "1rem",
                }}
              >
                <h5 style={{ color: msg.role === "user" ? frenchBlue : frenchRed }}>
                  {msg.role === "user" ? "🗣 You said:" : "🤖 AI Response:"}
                </h5>
                <p>{msg.text}</p>
              </div>
            ))}
      </div>
      <div className="text-center my-4">
        <button
          className="btn me-2"
          style={{
            backgroundColor: frenchBlue,
            color: frenchWhite,
            padding: "0.75rem 1.5rem",
            fontSize: "1.1rem",
            borderRadius: "0.3rem",
          }}
          onClick={startRecording}
          disabled={recording}
        >
          Start Recording
        </button>
        <button
          className="btn me-2"
          style={{
            backgroundColor: frenchRed,
            color: frenchWhite,
            padding: "0.75rem 1.5rem",
            fontSize: "1.1rem",
            borderRadius: "0.3rem",
          }}
          onClick={stopRecording}
          disabled={!recording}
        >
          Stop Recording
        </button>
        <div className="mt-3">
          <ReactMic
            record={recording}
            className="sound-wave"
            onStop={onStop}
            strokeColor={frenchBlue}
            backgroundColor="#fff"
            mimeType="audio/wav"
          />
        </div>
      </div>
      {currentMainQuestion === 3 && followupCount === 2 && finalScore === null && (
        <div className="text-center my-4">
          <button
            className="btn"
            style={{
              backgroundColor: frenchRed,
              color: frenchWhite,
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              borderRadius: "0.3rem",
            }}
            onClick={handleFinishTest}
          >
            Finish Test & See Results
          </button>
        </div>
      )}
      {finalScore !== null && (
        <div className="container my-5">
          <h2 className="text-center mb-4" style={{ color: frenchBlue }}>
            Test Completed!
          </h2>
          <h4 className="text-center mb-4" style={{ color: frenchRed }}>
            Final Score: {finalScore}/10
          </h4>
          <div className="card p-4">
            <h5>Feedback Summary:</h5>
            <p>{finalFeedback}</p>
          </div>
          <div className="text-center mt-4">
            <button
              className="btn"
              style={{ backgroundColor: frenchBlue, color: frenchWhite }}
              onClick={() => window.location.reload()}
            >
              Restart Test
            </button>
          </div>
        </div>
      )}
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
};

export default Speech;
