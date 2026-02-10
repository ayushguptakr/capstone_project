import React, { useEffect, useState } from "react";
import "./Submissions.css";
import trainToy from "./images/train_toy.jpg";

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found!");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/submissions/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("SUBMISSIONS:", data);
        setSubmissions(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="submissions-container"
      style={{ backgroundImage: `url(${trainToy})` }}
    >
      <div className="submissions-box">
        <h2 className="title">📁 My Submissions</h2>

        {loading ? (
          <p className="loading">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="empty-text">No submissions yet 😊</p>
        ) : (
          submissions.map((sub) => (
            <div className="submission-card" key={sub._id}>
              <h3>📌 Task: {sub.task?.title || "Unknown Task"}</h3>

              <p>
                📝 <strong>Answer:</strong> {sub.text || "No text"}
              </p>

              {sub.file && (
                <a
                  href={`http://localhost:5000/${sub.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="file-link"
                >
                  📎 View Uploaded File
                </a>
              )}

              <p className="date">
                📅 Submitted on:{" "}
                {new Date(sub.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Submissions;
