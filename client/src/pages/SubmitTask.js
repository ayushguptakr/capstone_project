import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, ArrowLeft } from "lucide-react";
import { IconBox } from "../components";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { apiRequest } from "../api/httpClient";

function SubmitTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const { triggerSuccess, triggerXPFromEvent } = useFeedback();
  const { playClick } = useSound();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();
    if (!text && !file) {
      alert("Add a description or upload proof!");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("text", text);
      if (file) formData.append("file", file);

      await apiRequest("/api/submissions/submit", {
        method: "POST",
        body: formData,
        isMultipart: true,
        retries: 0,
      });
      alert("Submission uploaded! 🌱");
      triggerSuccess();
      triggerXPFromEvent(10, e);
      navigate("/mysubmissions");
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-soft-lg p-8 border-2 border-eco-pale"
        >
          <div className="flex justify-center mb-4">
            <IconBox color="green" size="lg" className="rounded-2xl w-16 h-16 flex items-center justify-center">
              <Upload className="w-10 h-10" strokeWidth={2} />
            </IconBox>
          </div>
          <h1 className="font-display font-bold text-xl text-eco-primary text-center mb-6">
            Submit Task Proof
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">What did you do?</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your eco-action..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border-2 border-eco-pale focus:border-eco-primary outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Upload proof (photo)</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer
                  ${drag ? "border-eco-primary bg-eco-pale" : "border-gray-300 hover:border-eco-mint"}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
                  ) : (
                    <>
                      <span className="text-4xl block mb-2">📎</span>
                      <span className="text-gray-500">Drop image here or click to upload</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-eco-primary text-white font-bold text-lg disabled:opacity-70"
            >
              {loading ? "Uploading..." : "Upload Submission"}
            </motion.button>
          </form>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="mt-4 w-full py-2 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default SubmitTask;
