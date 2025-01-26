import React from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
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
  const { user } = useAuth(); // Get logged-in user's data from AuthContext

  const skillProgressData = {
    labels: ["Coding", "System Design", "Behavioral", "Aptitude"],
    datasets: [
      {
        label: "Skill Progress (%)",
        data: [70, 55, 85, 60], // Sample data; replace with actual progress data
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
      },
    ],
  };

  const weeklyProgressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Overall Progress (%)",
        data: [30, 50, 70, 85], // Sample data showing progress over time
        fill: true,
        backgroundColor: "rgba(66, 133, 244, 0.2)",
        borderColor: "rgba(66, 133, 244, 1)",
      },
    ],
  };

  const topicMasteryData = {
    labels: ["Data Structures", "Algorithms", "System Design"],
    datasets: [
      {
        label: "Topic Mastery",
        data: [60, 40, 20], // Replace with actual user's topic mastery levels
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Welcome, {user?.username}!</h2>
      <p className="text-center text-muted">
        Track your progress and performance in each interview preparation area.
      </p>
      
      <div className="row mt-5">
        <div className="col-md-6 mb-4">
          <h4 className="text-center">Skill Progress</h4>
          <Bar
            data={skillProgressData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Skill Progress (%)" },
              },
            }}
          />
        </div>

        <div className="col-md-6 mb-4">
          <h4 className="text-center">Weekly Progress</h4>
          <Line
            data={weeklyProgressData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Progress Over Time" },
              },
            }}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <h4 className="text-center">Topic Mastery</h4>
          <Doughnut
            data={topicMasteryData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: "Topic Mastery by Level" },
              },
            }}
          />
        </div>

        <div className="col-md-6">
          <h4 className="text-center">Summary</h4>
          <div className="card p-3 shadow-sm">
            <p>
              <strong>Overall Progress:</strong> 75% complete
            </p>
            <p>
              <strong>Highest Score:</strong> Behavioral - 85%
            </p>
            <p>
              <strong>Focus Area:</strong> System Design - Needs Improvement
            </p>
            <p>
              Keep practicing regularly to achieve your goals! Remember, consistency is key to mastering interview preparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;