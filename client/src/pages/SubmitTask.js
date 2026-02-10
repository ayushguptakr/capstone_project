import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SubmitTask.css";

import minion from "./images/minion.jpg";
import trainToy from "./images/train_toy.jpg";

function SubmitTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text && !file) {
      alert("Please write something or upload a file!");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // FormData for file + text
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("text", text);
      if (file) formData.append("file", file);

      const res = await axios.post(
        "http://localhost:5000/api/submissions/submit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Submission uploaded successfully!");
      navigate("/submissions");

    } catch (err) {
      console.log("Submit Error:", err);
      alert(err.response?.data?.message || "Submission failed!");
    }

    setLoading(false);
  };

  return (
    <div
      className="submit-container"
      style={{ backgroundImage: `url(${trainToy})` }}
    >
      <div className="submit-box">
        <img src={minion} className="submit-mascot" alt="mascot" />

        <h2 className="submit-title">📤 Submit Task #{taskId}</h2>

        <form onSubmit={handleSubmit}>
          <textarea
            className="submit-textarea"
            placeholder="Write your answer..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          <label className="file-label">
            📎 Upload File
            <input
              type="file"
              className="file-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Submission"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitTask;
