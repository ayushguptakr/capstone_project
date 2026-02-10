import React, { useEffect, useState } from "react";
import "./Tasks.css";
import { useNavigate } from "react-router-dom";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Task Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2 className="loading-text">Loading tasks...</h2>;

  return (
    <div className="tasks-page">
      <h2 className="tasks-title">📚 All Tasks</h2>

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <p className="no-task">No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div className="task-card" key={task._id}>
              <h3 className="task-title">📝 {task.title}</h3>

              <p className="task-desc">{task.description}</p>

              <div className="task-footer">
                <span className="points-badge">⭐ {task.points} Points</span>
                {task.deadline && (
                  <span className="deadline">
                    ⏳ {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              <button
                className="task-btn"
                onClick={() => navigate(`/submit/${task._id}`)}
              >
                Submit Task
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;
