import React, { useState } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from "chart.js";
import { useAuth } from "../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();

  // Interview data
  const [interviews, setInterviews] = useState([
    { date: "2025-01-01", success: true },
    { date: "2025-01-10", success: false },
    { date: "2025-01-15", success: true },
  ]);
  const streak = interviews.filter((interview) => interview.success).length;

  const handleInterviewConfirmation = () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    setInterviews([...interviews, { date: today, success: true }]);
  };

  // Data for modules completed
  const moduleData = {
    technical: 70,
    behavioral: 50,
    situational: 40,
    aptitude: 60,
    industrySpecific: 30,
  };

  const pieChartColors = ["#93c9e6", "#b2cca7", "#e3b8df", "#c29adb", "#f1f28d"];

  // Data for skills breakdown and time spent
  const skillsData = {
    labels: ["Problem Solving", "Communication", "Leadership", "Teamwork", "Adaptability"],
    datasets: [
      {
        label: "Skills Gained (%)",
        data: [80, 70, 65, 75, 60],
        backgroundColor: pieChartColors,
      },
    ],
  };

  const timeSpentData = {
    labels: ["Technical", "Behavioral", "Situational", "Aptitude", "Industry-Specific"],
    datasets: [
      {
        label: "Time Spent (Hours)",
        data: [10, 7, 5, 8, 6],
        backgroundColor: pieChartColors,
      },
    ],
  };

  // Behavioral progress
  const behavioralData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4"],
    datasets: [
      {
        label: "Behavioral Progress (%)",
        data: [60, 70, 80, 90],
        fill: true,
        backgroundColor: "rgba(66, 133, 244, 0.2)",
        borderColor: "#93c9e6",
      },
    ],
  };

  // Comparison with others
  const comparisonData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Your Progress (%)",
        data: [60, 70, 80, 90],
        borderColor: "hsl(201, 69.80%, 68.80%)",
        fill: false,
      },
      {
        label: "Average Progress (%)",
        data: [50, 65, 75, 85],
        borderColor: "#b2cca7",
        fill: false,
      },
    ],
  };

  // Difficulty level progress for three pie charts
  const easyData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [50, 50],
        backgroundColor: [pieChartColors[0], "#e0e0e0"],
      },
    ],
  };

  const moderateData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [35, 65],
        backgroundColor: [pieChartColors[1], "#e0e0e0"],
      },
    ],
  };

  const advancedData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [15, 85],
        backgroundColor: [pieChartColors[2], "#e0e0e0"],
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Welcome, {user?.username}!</h2>
      <p className="text-center text-muted">
        Track your interview preparation progress and performance.
      </p>

      {/* Streak Section */}
      <div className="mt-4 text-center">
        <h4>Streak: 1</h4>
        <p>Keep up the good work! Your next interview could be your best one.</p>
        <p>Check the box if you got selected for the position!</p>
        <button className="btn btn mt-3 custom-button" onClick={handleInterviewConfirmation}>
          GOT THE JOB✓
        </button>
      </div>

      {/* First Row: Modules Completed */}
      <div className="row mt-5">
        <div className="col-md-2 mb-4">
          <h5 className="text-center">Technical</h5>
          <Doughnut
            data={{
              labels: ["Completed", "Remaining"],
              datasets: [
                {
                  data: [moduleData.technical, 100 - moduleData.technical],
                  backgroundColor: [pieChartColors[0], "#e0e0e0"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              maintainAspectRatio: true,
              aspectRatio: 1,
              height: 100,
              width: 100,
            }}
            className="pie-chart"
          />
        </div>
        <div className="col-md-2 mb-4">
          <h5 className="text-center">Behavioral</h5>
          <Doughnut
            data={{
              labels: ["Completed", "Remaining"],
              datasets: [
                {
                  data: [moduleData.behavioral, 100 - moduleData.behavioral],
                  backgroundColor: [pieChartColors[1], "#e0e0e0"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              maintainAspectRatio: true,
              aspectRatio: 1,
              height: 100,
              width: 100,
            }}
            className="pie-chart"
          />
        </div>
        <div className="col-md-2 mb-4">
          <h5 className="text-center">Situational</h5>
          <Doughnut
            data={{
              labels: ["Completed", "Remaining"],
              datasets: [
                {
                  data: [moduleData.situational, 100 - moduleData.situational],
                  backgroundColor: [pieChartColors[2], "#e0e0e0"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              maintainAspectRatio: true,
              aspectRatio: 1,
              height: 100,
              width: 100,
            }}
            className="pie-chart"
          />
        </div>
        <div className="col-md-2 mb-4">
          <h5 className="text-center">Aptitude</h5>
          <Doughnut
            data={{
              labels: ["Completed", "Remaining"],
              datasets: [
                {
                  data: [moduleData.aptitude, 100 - moduleData.aptitude],
                  backgroundColor: [pieChartColors[3], "#e0e0e0"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              maintainAspectRatio: true,
              aspectRatio: 1,
              height: 100,
              width: 100,
            }}
            className="pie-chart"
          />
        </div>
        <div className="col-md-2 mb-4">
          <h5 className="text-center">Industry-Specific</h5>
          <Doughnut
            data={{
              labels: ["Completed", "Remaining"],
              datasets: [
                {
                  data: [moduleData.industrySpecific, 100 - moduleData.industrySpecific],
                  backgroundColor: [pieChartColors[4], "#e0e0e0"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              maintainAspectRatio: true,
              aspectRatio: 1,
              height: 100,
              width: 100,
            }}
            className="pie-chart"
          />
        </div>
      </div>

      {/* Second Row: Skills Breakdown and Time Spent */}
      <div className="row mt-5">
        <div className="col-md-6 col-12">
          <h4 className="text-center">Skills Breakdown</h4>
          <Bar
            data={skillsData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Skills Gained Breakdown" },
              },
            }}
          />
        </div>
        <div className="col-md-6 col-12">
          <h4 className="text-center">Time Spent on Each Skill</h4>
          <Bar
            data={timeSpentData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Time Spent (Hours)" },
              },
            }}
          />
        </div>
      </div>

      {/* Third Row: Behavioral, Comparison, and Difficulty */}
      <div className="row mt-5">
        <div className="col-md-4 col-12">
          <h4 className="text-center">Behavioral Progress</h4>
          <Line
            data={behavioralData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Behavioral Interview Progress" },
              },
            }}
          />
        </div>
        <div className="col-md-4 col-12">
          <h4 className="text-center">Comparison with Others</h4>
          <Line
            data={comparisonData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Your Progress vs. Others" },
              },
            }}
          />
        </div>
        <div className="col-md-4 col-12">
          <h4 className="text-center">Difficulty Level Completed</h4>
          <div className="row">
            <div className="col-4">
              <Doughnut data={easyData} options={{ responsive: true }} />
            </div>
            <div className="col-4">
              <Doughnut data={moderateData} options={{ responsive: true }} />
            </div>
            <div className="col-4">
              <Doughnut data={advancedData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

