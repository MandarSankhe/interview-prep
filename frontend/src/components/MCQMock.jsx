import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { Clock } from "lucide-react";

const MCQMock = () => {
  const { user } = useAuth();
  const [allExams, setAllExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  // Format time remaining into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeRemaining]);

  // Handle time up
  const handleTimeUp = () => {
    setTimerActive(false);
    handleSubmitExam();
    setShowTimeoutModal(true);
  };

  // Reset timer when new exam is selected
  useEffect(() => {
    if (selectedExam) {
      setTimeRemaining(60 * 60);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [selectedExam]);


  useEffect(() => {
    const fetchAllmcqTest = async () => {
      const query = `
        query GetAllmcqTest {
          mcqTests {
            id
            title
            level
            documents {
              document {
                title
                content
              }
              questions {
                questionText
                options
                correctAnswer
              }
            }
          }
        }
      `;
      try {
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const result = await response.json();
        console.log("result: ", result.data.mcqTests);
        if (result.errors) {
          console.error("GraphQL errors:", result.errors);
          throw new Error(result.errors[0].message);
        }
        setAllExams(result.data.mcqTests);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllmcqTest();
  }, []);

  useEffect(() => {
    if (!selectedExam) return;

    let calculatedScore = 0;
    selectedExam.documents.forEach((docSet, docIndex) => {
      docSet.questions.forEach((question, qIndex) => {
        const key = `${docIndex}-${qIndex}`;
        if (userAnswers[key] === question.correctAnswer) {
          calculatedScore++;
        }
      });
    });
    setLiveScore(calculatedScore);
  }, [userAnswers, selectedExam]);

  // [All other handler functions remain the same]
  const handleExamSelection = (examId) => {
    const exam = allExams.find((e) => e.id === examId);
    setSelectedExam(exam);
    setCurrentDocumentIndex(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowSummary(false);
    setScore(0);
    setLiveScore(0);
    setTimeRemaining(60 * 60);
    setTimerActive(true);
  };

  const handleAnswerChange = (e) => {
    const answerKey = `${currentDocumentIndex}-${currentQuestionIndex}`;
    setUserAnswers({ ...userAnswers, [answerKey]: e.target.value });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNextDocument = () => {
    setCurrentDocumentIndex((prev) => prev + 1);
    setCurrentQuestionIndex(0);
  };

  const handlePreviousDocument = () => {
    setCurrentDocumentIndex((prev) => prev - 1);
    setCurrentQuestionIndex(0);
  };

  const handleJumpToQuestion = (docIndex, quesIndex) => {
    setCurrentDocumentIndex(docIndex);
    setCurrentQuestionIndex(quesIndex);
  };

  const getLevelClass = (level) => {
    switch (level) {
      case "Beginner":
        return "list-group-item-success";
      case "Intermediate":
        return "list-group-item-warning";
      case "Advanced":
        return "list-group-item-danger";
      default:
        return "list-group-item-light";
    }
  };

  const handleSubmitExam = () => {
    if (!selectedExam) return;
    setTimerActive(false);
    let calculatedScore = 0;
    selectedExam.documents.forEach((docSet, docIndex) => {
      docSet.questions.forEach((question, qIndex) => {
        const key = `${docIndex}-${qIndex}`;
        if (userAnswers[key] === question.correctAnswer) {
          calculatedScore += 1;
        }
      });
    });
    setScore(calculatedScore);
    setShowSummary(true);
  };

  if (allExams.length === 0 && !selectedExam) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!selectedExam) {
    return (
      <div className="container mt-5">
        <h2 className="mb-4 text-center text-primary">Select a MCQ Exam</h2>
        <div className="list-group shadow-lg">
          {allExams.map((exam) => (
            <button
              key={exam.id}
              className={`list-group-item list-group-item-action ${getLevelClass(exam.level)}`}
              onClick={() => handleExamSelection(exam.id)}
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <strong>{exam.title}</strong>
              <span className="float-right">Level: {exam.level}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const totalQuestions = selectedExam.documents.reduce(
    (acc, docSet) => acc + docSet.questions.length,
    0
  );

  let questionsBeforeCurrentDoc = 0;
  for (let i = 0; i < currentDocumentIndex; i++) {
    questionsBeforeCurrentDoc += selectedExam.documents[i].questions.length;
  }
  const globalQuestionNumber = questionsBeforeCurrentDoc + (currentQuestionIndex + 1);

  const { documents } = selectedExam;
  const currentDoc = documents[currentDocumentIndex];
  const questions = currentDoc.questions;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container-fluid">
      <h2 className="text-center mb-4">MCQ Mock Test</h2>

      {/* Timer Display */}
      <div className="position-fixed top-5 end-0 m-3 p-3 bg-light rounded shadow-sm">
        <div className="d-flex align-items-center">
          <Clock className="me-2" size={24} />
          <span className={`fw-bold ${timeRemaining <= 300 ? 'text-danger' : ''}`}>
            Time Remaining: {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Timeout Modal */}
      <div className={`modal fade ${showTimeoutModal ? 'show' : ''}`} 
           style={{ display: showTimeoutModal ? 'block' : 'none' }}
           tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Time's Up!</h5>
            </div>
            <div className="modal-body">
              <p>Your time has expired. Your answers have been automatically submitted.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowTimeoutModal(false);
                  setSelectedExam(null);
                }}
              >
                Return to Exam List
              </button>
            </div>
          </div>
        </div>
      </div>
      {showTimeoutModal && <div className="modal-backdrop fade show"></div>}

      {/* Rest of your component remains the same */}
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-4">
          <button
            className="btn btn-outline-secondary w-100 mb-3"
            onClick={() => setSelectedExam(null)}
          >
            Back to Exam Selection
          </button>
          
          <div className="card">
            <div className="card-header">
              <strong>Exam Navigation</strong>
            </div>
            <div className="card-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="mb-3">
                <strong>Live Score: </strong>{liveScore}/{totalQuestions}
              </div>
              {documents.map((docSet, docIdx) => (
                <div key={docIdx} className="mb-4">
                  <h5 style={{ fontSize: "1rem" }}>
                    Document {docIdx + 1}: {docSet.document.title}
                  </h5>
                  <ul className="list-group">
                    {docSet.questions.map((q, qIdx) => {
                      const questionNumber = 
                        documents.slice(0, docIdx).reduce((acc, ds) => acc + ds.questions.length, 0)
                        + qIdx + 1;
                      return (
                        <li
                          key={qIdx}
                          className="list-group-item list-group-item-action"
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              docIdx === currentDocumentIndex &&
                              qIdx === currentQuestionIndex
                                ? "#dcecf7" 
                                : "transparent"
                          }}
                          onClick={() => handleJumpToQuestion(docIdx, qIdx)}
                        >
                          Question {questionNumber}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <h4>
            Exam: {selectedExam.title} | Level: {selectedExam.level}
          </h4>

          <div className="mt-4">
            <h5>
              Document {currentDocumentIndex + 1}: {currentDoc.document.title}
            </h5>
            <p>{currentDoc.document.content}</p>
          </div>

          {showSummary ? (
            // Summary / Results Section
            <div className="alert alert-info">
              <h3 className="text-center">Test Completed!</h3>
              <p className="text-center">
                Your Final Score: {score} / {totalQuestions}
              </p>

              <hr />
              <h4>Review Your Answers</h4>
              {documents.map((docSet, docIdx) => (
                <div key={docIdx} className="mt-3">
                  <h5>Document {docIdx + 1}: {docSet.document.title}</h5>
                  {docSet.questions.map((question, qIdx) => {
                    const answerKey = `${docIdx}-${qIdx}`;
                    const userAnswer = userAnswers[answerKey];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <div key={qIdx} className="mt-2">
                        <strong>Question:</strong> {question.questionText}
                        <br />
                        {isCorrect ? (
                          <span style={{ color: "green" }}>
                            Your answer: {userAnswer} (Correct)
                          </span>
                        ) : (
                          <span style={{ color: "red" }}>
                            Your answer: {userAnswer ?? "No answer selected"} (Incorrect)  
                            <br />
                            Correct answer: {question.correctAnswer}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Current Question Card */}
              <div className="card shadow-lg p-4">
                <h5>
                  Question {globalQuestionNumber} of {totalQuestions}
                </h5>
                <p>{currentQuestion.questionText}</p>
                {currentQuestion.options.map((option, idx) => {
                  const answerKey = `${currentDocumentIndex}-${currentQuestionIndex}`;
                  return (
                    <div key={idx} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${currentDocumentIndex}-${currentQuestionIndex}`}
                        value={option}
                        checked={userAnswers[answerKey] === option}
                        onChange={handleAnswerChange}
                      />
                      <label className="form-check-label">{option}</label>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons for questions */}
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous Question
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={handleNextQuestion}>
                    Next Question
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={handleNextDocument}
                    disabled={currentDocumentIndex === documents.length - 1}
                  >
                    Next Document
                  </button>
                )}
              </div>

              {/* Document-level navigation */}
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-outline-warning"
                  onClick={handlePreviousDocument}
                  disabled={currentDocumentIndex === 0}
                >
                  Previous Document
                </button>

                {/* Show "Submit Test" only on the last document's last question */}
                {currentDocumentIndex === documents.length - 1 &&
                  currentQuestionIndex === questions.length - 1 && (
                    <button className="btn btn-success" onClick={handleSubmitExam}>
                      Submit Test
                    </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQMock;