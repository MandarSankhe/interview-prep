// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MCQMock from "./components/MCQMock";
import WritingMock from "./components/WritingMock";
import Speech from "./components/Speech";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected route component to restrict access if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mcqmock"
              element={
                <ProtectedRoute>
                  <MCQMock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/writingmock"
              element={
                <ProtectedRoute>
                  <WritingMock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/speech"
              element={
                <ProtectedRoute>
                  <Speech />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
