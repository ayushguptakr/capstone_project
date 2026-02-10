// src/pages/CreateTask.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTask.css";

function CreateTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(10);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // must be teacher token
      const res = await fetch("http://localhost:5000/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ title, description, points, deadline }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || data.error || "Failed to create task");
        return;
      }

      // success -> go to tasks list
      navigate("/tasks");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Network error");
    }
  };

  return (
    <div className="create-page">
      <div className="create-card">
        <h2>Create New Task</h2>

        <form onSubmit={handleCreate} className="create-form">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Plant a Tree)"
            required
          />

          <textarea
            className="input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            rows={4}
          />

          <input
            className="input"
            type="number"
            value={points}
            min={0}
            onChange={(e) => setPoints(Number(e.target.value))}
            placeholder="Points"
          />

          <input
            className="input"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;
