import React from "react";
import { Link } from "react-router-dom";

const Speech = () => {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>Welcome to InterviewPrep</h1>
        <p>Your ultimate platform for tech job interview preparation!</p>
        <Link to="/register" className="btn btn-primary mt-3">
          Get Started
        </Link>
      </div>
      <section className="mt-5">
        <div className="row">
          <div className="col-md-4">
            <h3>Comprehensive Exercises</h3>
            <p>Practice coding, system design, behavioral questions, and aptitude tests with our tailored exercises designed for all levels.</p>
          </div>
          <div className="col-md-4">
            <h3>Personalized Learning</h3>
            <p>Track your progress and get personalized feedback to help you focus on areas that need improvement.</p>
          </div>
          <div className="col-md-4">
            <h3>Mock Interviews</h3>
            <p>Participate in mock interviews to get real-time feedback and improve your interview skills.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Speech;