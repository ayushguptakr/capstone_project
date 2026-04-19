import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherTasks.css";
import { apiRequest } from "../api/httpClient";

function TeacherTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const data = await apiRequest("/api/tasks/my");
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="teacher-tasks-loading">Loading your tasks...</div>;

  return (
    <div className="teacher-tasks-page">
      <div className="teacher-tasks-header">
        <h1>🌱 My Created Tasks</h1>
        <button className="eco-back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="teacher-tasks-grid">
        {tasks.length === 0 ? (
          <div className="no-tasks-eco">
            <p>You haven't created any tasks yet.</p>
            <button className="eco-create-btn" onClick={() => navigate("/create-task")}>
              Create Your First Task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="teacher-task-card">
              <div className="teacher-task-category">{task.category || "Eco Task"}</div>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <div className="teacher-task-footer">
                <span className="eco-points flex items-center gap-1"><Star size={16} className="text-yellow-500" /> {task.points} pts</span>
                {task.deadline && (
                  <span className="eco-deadline">📅 {new Date(task.deadline).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TeacherTasks;
