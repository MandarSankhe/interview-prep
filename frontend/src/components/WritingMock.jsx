import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import OverlaySpinner from "./OverlaySpinner";


const WritingMock = () => {
  const [allExams, setAllExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState("");

  const handleKeyboardChange = (input) => {
    // Sync on-screen keyboard input directly with the response
    setKeyboardInput(input);
    setResponse(input); // Update the response directly with the on-screen keyboard input
  };
  
  const handlePhysicalKeyboardInput = (e) => {
    const newValue = e.target.value;
    setResponse(newValue); // Update response state with physical keyboard input
    setKeyboardInput(newValue); // Sync on-screen keyboard with physical input
  };


  useEffect(() => {
    const fetchAllCodeInterviews = async () => {
      const query = `
        query GetAllCodeInterviews {
          codeInterviews {
            id
            title
            level
            challenge1
            challenge2
            challenge3
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
        setAllExams(result.data.codeInterviews);
      } catch (error) {
        console.error("Error fetching code interviews:", error);
      }
    };

    fetchAllCodeInterviews();
  }, []);

  const handleExamSelection = (examId) => {
    const exam = allExams.find((e) => e.id === examId);
    setSelectedExam(exam);
    setExerciseIndex(0);
    setFeedback("");
    setCurrentExercise(exam.challenge1);
  };

  const handleSubmitExercise = async () => {
    setLoading(true);
    try {
      const prompt = `

        Question: ${currentExercise}
        Code Answer:
        ${response}

        Provide feedback on:
        1. Syntax correctness.
        2. Logical correctness.
        3. Code efficiency.
        4. Suggestions for improvement.

        and give the score out of 10
      `;
  
      const res = await fetch("http://localhost:4000/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await res.json();
      setFeedback(data.feedback || "No feedback received.");
      
    } catch (error) {
      setFeedback("Error fetching feedback. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleNextExercise = () => {
    const exercises = [
      selectedExam.challenge1,
      selectedExam.challenge2,
      selectedExam.challenge3,
    ];
    if (exerciseIndex + 1 < exercises.length) {
      setExerciseIndex(exerciseIndex + 1);
      setCurrentExercise(exercises[exerciseIndex + 1]);
      setFeedback("");
    } else {
      alert("You have completed all exercises!");
      setSelectedExam(null);
    }
  };

  if (!selectedExam) {
    return (
      <div className="container">
        <h2 className="mb-4 text-center">Select a Coding/Writing Exam</h2>
        <div className="list-group">
          {allExams && allExams.length > 0 ? (
            allExams.map((exam) => (
              <button
                key={exam.id}
                className="list-group-item list-group-item-action"
                onClick={() => handleExamSelection(exam.id)}
              >
                <strong>{exam.title}</strong> - Level: {exam.level}
              </button>
            ))
          ) : (
            <p className="text-center">No exams available</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {loading && <OverlaySpinner />}
      <h2 className="text-center mb-4">Writing Test: {selectedExam.title}</h2>
      <div className="mb-4">
        <button className="btn btn-secondary" onClick={() => setSelectedExam(null)}>
          Back to Exam Selection
        </button>
      </div>
      <div className="mb-4">
        <h4>Exercise {exerciseIndex + 1}:</h4>
        <p>{currentExercise}</p>
        <textarea
          className="form-control"
          rows="5"
          value={response}
          onChange={handlePhysicalKeyboardInput}
          placeholder="Write your answer here..."
        />
      </div>

      {feedback && (
        <div className="mt-4">
          <h5>Feedback:</h5>
          <p dangerouslySetInnerHTML={{ __html: feedback }} />
        </div>
      )}
      <div className="text-center">
        <button className="btn btn-primary me-2" onClick={handleSubmitExercise} disabled={loading}>
          {loading ? "Submitting..." : "Submit Exercise"}
        </button>
        {feedback && (
          <button className="btn btn-success" onClick={handleNextExercise}>
            Next Exercise
          </button>
        )}
      </div>
    </div>
  );
};

export default WritingMock;
