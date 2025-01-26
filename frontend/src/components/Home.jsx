import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mt-5">
      {/* Header Section */}
      <div className="text-start">
        <h1 className="display-1 fw-bold body blue mb-3">WELCOME TO HIRELY!</h1>
        <h1 className="display-4 fw-bold mycolour mb-3">Ace your next interview!</h1>
        <p className="lead text-muted w-50">
          Interact with your personalized AI-powered interviewer. Simulate real-time interviews and receive actionable, insightful feedback.
          Experience the world's most advanced AI interviewer.
        </p>
        <Link to="/register" className="btn btn mt-3 custom-button">
          Start My Interview ↗
        </Link>
      </div>

      {/* Features Section */}
      <section className="mt-5">
        <div className="feature">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h3 className="h5 fw-bold">Get actionable, constructive feedback</h3>
              <p className="text-muted">
                We give you actionable and constructive feedback so you can improve your interview technique. Work your way up and perfect your answers with personalized tips.
              </p>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="../feedback.png"
                alt="Constructive Feedback"
                className="feature-image"
              />
            </div>
          </div>
        </div>

        <div className="feature mt-5">
          <div className="row align-items-center flex-row-reverse">
            <div className="col-md-6">
              <h3 className="h5 fw-bold">Access to Numerous Modules</h3>
              <p className="text-muted">
                Unlock a wealth of learning opportunities with access to a wide range of expertly designed modules. Whether you're enhancing specific skills or exploring new areas, our diverse selection caters to every need, empowering you to learn at your own pace and convenience.
              </p>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="../modules.png"
                alt="Numerous Modules"
                className="feature-image"
              />
            </div>
          </div>
        </div>

        <div className="feature mt-5">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h3 className="h5 fw-bold">Tailored Interview Scenarios</h3>
              <p className="text-muted">
                Experience interviews tailored to your career aspirations. Whether you're preparing for a tech role, a management position, or a creative job, our platform adapts to your needs, providing realistic, role-specific questions and scenarios to help you excel.
              </p>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="../scenarios.png"
                alt="Tailored Scenarios"
                className="feature-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-5">
        <h2 className="h3 fw-bold text-center">What Our Users Are Saying</h2>
        <div className="row mt-4">
          <div className="col-md-4">
            <div
              className="card shadow-sm p-4 text-center"
              style={{ height: "300px" }}
            >
              <div className="d-flex flex-column align-items-center">
                <img
                  src="../pic1.png"
                  alt="Alex Johnson"
                  className="rounded-circle mb-3"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <blockquote className="blockquote">
                  <p className="mb-3">
                    "Hirely helped me land my dream job! The feedback was spot on and incredibly useful."
                  </p>
                  <footer className="blockquote-footer">
                    Alex Johnson, <cite title="Software Engineer">Software Engineer</cite>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm p-4 text-center"
              style={{ height: "300px" }}
            >
              <div className="d-flex flex-column align-items-center">
                <img
                  src="../pic2.png"
                  alt="Samantha Lee"
                  className="rounded-circle mb-3"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <blockquote className="blockquote">
                  <p className="mb-3">
                    "The tailored scenarios felt like the real deal. It gave me the confidence I needed."
                  </p>
                  <footer className="blockquote-footer">
                    Samantha Lee, <cite title="Marketing Manager">Marketing Manager</cite>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm p-4 text-center"
              style={{ height: "300px" }}
            >
              <div className="d-flex flex-column align-items-center">
                <img
                  src="../pic3.png"
                  alt="Ryan Patel"
                  className="rounded-circle mb-3"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <blockquote className="blockquote">
                  <p className="mb-3">
                    "I've never felt so prepared for an interview. Hirely is a game-changer!"
                  </p>
                  <footer className="blockquote-footer">
                    Ryan Patel, <cite title="Data Analyst">Data Analyst</cite>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="mt-5 text-center">
        <h2 className="display-6 fw-bold body mycolour mb-3">Ready to Start Your Journey?</h2>
        <Link to="/register" className="btn btn-lg mt-3 custom-button">
          Sign Up Now
        </Link>
      </section>
    </div>
  );
};

export default Home;


