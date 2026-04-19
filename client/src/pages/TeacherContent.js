import React, { useEffect, useState } from "react";
import TeacherShell from "../components/TeacherShell";
import { Sparkles } from "lucide-react";
import { apiRequest } from "../api/httpClient";
import { fetchTeacherBootstrap } from "../api/teacherApi";
import { useAlert } from "../components/ui/AlertProvider";

export default function TeacherContent() {
  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [msg, setMsg] = useState("");
  const { showAlert } = useAlert();
  
  // Transitioning quizDraft from a single question to an array of questions Native UI compatibility
  const [quizDraft, setQuizDraft] = useState({
    title: "", description: "", difficulty: "medium", 
    questions: [
      { question: "", options: ["", "", "", ""], answerIndex: 0, points: 5 }
    ]
  });

  const [taskDraft, setTaskDraft] = useState({
    title: "", description: "", instructions: "", submissionType: "photo", xpReward: 25, deadline: "",
  });

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => {
      setTasks(d.tasks || []);
      setQuizzes(d.quizzes || []);
    });
  }, []);

  async function createQuiz() {
    if (!quizDraft.title) return;
    
    // Ensure valid nested structure natively
    const validQuestions = quizDraft.questions.filter(q => q.question && q.options.some(x => x.trim()));
    if (validQuestions.length === 0) return showAlert({ type: "warning", message: "Quiz needs at least one valid question." });

    const payloadQuestions = validQuestions.map(q => ({
      ...q,
      correctAnswer: Number(q.answerIndex) || 0,
      options: q.options.map(str => str || "Empty Option") // Fallback
    }));

    const created = await apiRequest("/api/quizzes/create", {
      method: "POST",
      retries: 0,
      body: {
        title: quizDraft.title,
        description: quizDraft.description,
        difficulty: quizDraft.difficulty,
        category: "waste-management",
        questions: payloadQuestions,
      },
    });
    setQuizzes((p) => [created.quiz, ...p]);
    setOpenQuiz(false);
    setQuizDraft({ title: "", description: "", difficulty: "medium", questions: [{ question: "", options: ["", "", "", ""], answerIndex: 0, points: 5 }] });
    setMsg("Quiz created.");
    setTimeout(() => setMsg(""), 1500);
  }

  async function createTask() {
    if (!taskDraft.title || !taskDraft.description) return;
    const created = await apiRequest("/api/tasks/create", {
      method: "POST",
      retries: 0,
      body: {
        title: taskDraft.title,
        description: `${taskDraft.description}\n\nInstructions: ${taskDraft.instructions}\nSubmission type: ${taskDraft.submissionType}`,
        points: Number(taskDraft.xpReward) || 10,
        deadline: taskDraft.deadline || undefined,
      },
    });
    setTasks((p) => [created.task, ...p]);
    setOpenTask(false);
    setMsg("Task created.");
    setTimeout(() => setMsg(""), 1500);
  }

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  async function generateAIQuiz() {
    if (!aiTopic) return showAlert({ type: "warning", message: "Enter a topic for AI to use." });
    setAiLoading(true);
    try {
      const resp = await apiRequest("/api/teacher/generate-quiz", {
        method: "POST",
        body: { topic: aiTopic, classContext: "standard" }
      });
      // Safety guard in case AI severely malfunctions despite backend repair loops 
      if (!resp || !resp.questions || resp.questions.length === 0) {
        throw new Error("Invalid format");
      }
      setQuizDraft(p => ({
        ...p,
        title: resp.title || p.title,
        description: resp.description || p.description,
        difficulty: resp.difficulty || p.difficulty,
        questions: resp.questions.map(q => ({
          question: q.question,
          options: q.options,
          answerIndex: q.answerIndex,
          points: 10 // constant 10 points per question created by AI
        }))
      }));
      setAiTopic("");
    } catch (err) {
      // Fallback pre-fill so teacher isn't totally blocked
      setQuizDraft(p => ({
        ...p,
        title: `${aiTopic} Quiz`,
        description: "Please evaluate your understanding."
      }));
      showAlert({ type: "error", message: "[AI Fallback] Could not auto-generate questions fully. Title pre-filled." });
    } finally {
      setAiLoading(false);
    }
  }

  async function generateAITask() {
    if (!aiTopic) return showAlert({ type: "warning", message: "Enter a topic for AI to use." });
    setAiLoading(true);
    try {
      const generated = await apiRequest("/api/teacher/generate-mission", {
        method: "POST",
        body: { topic: aiTopic, difficulty: "medium" } // Defaulting to medium for quick UI via popup
      });
      setTaskDraft(p => ({
        ...p,
        title: generated.title,
        description: generated.description,
        xpReward: generated.xpReward || 20
      }));
      setAiTopic("");
    } catch (err) {
      showAlert({ type: "error", message: "AI generation failed, please try again." });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <TeacherShell title="Quizzes & Tasks" subtitle="Create content in modal forms and manage from clean tables.">
      {msg ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{msg}</div> : null}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Quizzes</h3>
            <button onClick={() => setOpenQuiz(true)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm">New Quiz</button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-2 text-left">Title</th><th className="p-2 text-left">Difficulty</th></tr></thead>
              <tbody>{quizzes.slice(0, 12).map((q) => <tr key={q._id} className="border-t"><td className="p-2">{q.title}</td><td className="p-2 capitalize">{q.difficulty}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Tasks</h3>
            <button onClick={() => setOpenTask(true)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm">New Task</button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-2 text-left">Title</th><th className="p-2 text-left">Points</th></tr></thead>
              <tbody>{tasks.slice(0, 12).map((t) => <tr key={t._id} className="border-t"><td className="p-2">{t.title}</td><td className="p-2">{t.points}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>

      {openQuiz ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center overflow-y-auto" onClick={() => setOpenQuiz(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 my-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-3">Create Quiz</h3>
            
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <input value={quizDraft.title} onChange={(e) => setQuizDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-200 px-3 py-2" />
              <select value={quizDraft.difficulty} onChange={(e) => setQuizDraft((p) => ({ ...p, difficulty: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
              <textarea value={quizDraft.description} onChange={(e) => setQuizDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2" />
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {quizDraft.questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Question {qIndex + 1}</span>
                    <button 
                      onClick={() => setQuizDraft(p => ({ ...p, questions: p.questions.filter((_, idx) => idx !== qIndex) }))}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                  <input 
                    value={q.question} 
                    onChange={(e) => setQuizDraft(p => ({ ...p, questions: p.questions.map((item, idx) => idx === qIndex ? { ...item, question: e.target.value } : item) }))} 
                    placeholder="Question Text" 
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 mb-2" 
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {q.options.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`} 
                          checked={Number(q.answerIndex) === i} 
                          onChange={() => setQuizDraft(p => ({ ...p, questions: p.questions.map((item, idx) => idx === qIndex ? { ...item, answerIndex: i } : item) }))}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <input 
                          value={o} 
                          onChange={(e) => setQuizDraft(p => ({ ...p, questions: p.questions.map((item, idx) => idx === qIndex ? { ...item, options: item.options.map((opt, optIdx) => optIdx === i ? e.target.value : opt) } : item) }))} 
                          placeholder={`Option ${i + 1}`} 
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm bg-white" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setQuizDraft(p => ({ ...p, questions: [...p.questions, { question: "", options: ["", "", "", ""], answerIndex: 0, points: 5 }] }))}
              className="mt-3 text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              + Add Question Manually
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <input 
                value={aiTopic} 
                onChange={(e) => setAiTopic(e.target.value)} 
                placeholder="Topic (e.g. Composting)" 
                className="rounded-xl border border-slate-200 px-3 py-1.5 flex-1 text-sm bg-slate-50 focus:border-purple-400 outline-none" 
                disabled={aiLoading}
              />
              <button 
                onClick={generateAIQuiz} 
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition whitespace-nowrap text-sm flex gap-1 items-center"
              >
                 {aiLoading ? "Gathering Intel..." : <span className="flex justify-center items-center gap-1"><Sparkles className="w-4 h-4" /> Auto-generate Entire Quiz</span>}
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded-xl border font-semibold text-slate-600" onClick={() => setOpenQuiz(false)}>Cancel</button>
              <button className="px-3 py-2 rounded-xl bg-emerald-600 font-bold text-white shadow-sm" onClick={createQuiz}>Publish Quiz</button>
            </div>
          </div>
        </div>
      ) : null}

      {openTask ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setOpenTask(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-3">Create Task</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <input value={taskDraft.title} onChange={(e) => setTaskDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-200 px-3 py-2" />
              <input type="date" value={taskDraft.deadline} onChange={(e) => setTaskDraft((p) => ({ ...p, deadline: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2" />
              <textarea value={taskDraft.description} onChange={(e) => setTaskDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2" />
              
              <div className="sm:col-span-2 flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                <input 
                  value={aiTopic} 
                  onChange={(e) => setAiTopic(e.target.value)} 
                  placeholder="Topic (e.g. Composting)" 
                  className="rounded-xl border border-slate-200 px-3 py-1.5 flex-1 text-sm bg-slate-50" 
                  disabled={aiLoading}
                />
                <button 
                  onClick={generateAITask} 
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition whitespace-nowrap text-sm flex gap-1 items-center"
                >
                   {aiLoading ? "Loading..." : <span className="flex justify-center items-center gap-1"><Sparkles className="w-4 h-4" /> Auto-fill</span>}
                </button>
              </div>

            </div>
            <div className="mt-4 flex justify-end gap-2"><button className="px-3 py-2 rounded-xl border font-semibold text-slate-600" onClick={() => setOpenTask(false)}>Cancel</button><button className="px-3 py-2 rounded-xl bg-blue-600 font-bold text-white shadow-sm" onClick={createTask}>Create</button></div>
          </div>
        </div>
      ) : null}
    </TeacherShell>
  );
}
