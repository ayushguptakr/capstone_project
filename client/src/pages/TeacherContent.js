import React, { useEffect, useState } from "react";
import TeacherShell from "../components/TeacherShell";
import { apiRequest } from "../api/httpClient";
import { fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherContent() {
  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [msg, setMsg] = useState("");
  const [quizDraft, setQuizDraft] = useState({
    title: "", description: "", difficulty: "medium", question: "", options: ["", "", "", ""], answerIndex: 0, xpReward: 20,
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
    if (!quizDraft.title || !quizDraft.question || quizDraft.options.some((x) => !x.trim())) return;
    const created = await apiRequest("/api/quizzes/create", {
      method: "POST",
      retries: 0,
      body: {
        title: quizDraft.title,
        description: quizDraft.description,
        difficulty: quizDraft.difficulty,
        category: "waste-management",
        questions: [{
          question: quizDraft.question,
          options: quizDraft.options,
          correctAnswer: Number(quizDraft.answerIndex) || 0,
          points: Number(quizDraft.xpReward) || 5,
        }],
      },
    });
    setQuizzes((p) => [created.quiz, ...p]);
    setOpenQuiz(false);
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
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setOpenQuiz(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-3">Create Quiz</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <input value={quizDraft.title} onChange={(e) => setQuizDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-200 px-3 py-2" />
              <select value={quizDraft.difficulty} onChange={(e) => setQuizDraft((p) => ({ ...p, difficulty: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
              <textarea value={quizDraft.description} onChange={(e) => setQuizDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2" />
              <input value={quizDraft.question} onChange={(e) => setQuizDraft((p) => ({ ...p, question: e.target.value }))} placeholder="Question" className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2" />
              {quizDraft.options.map((o, i) => <input key={i} value={o} onChange={(e) => setQuizDraft((p) => ({ ...p, options: p.options.map((x, idx) => idx === i ? e.target.value : x) }))} placeholder={`Option ${i + 1}`} className="rounded-xl border border-slate-200 px-3 py-2" />)}
            </div>
            <div className="mt-4 flex justify-end gap-2"><button className="px-3 py-2 rounded-xl border" onClick={() => setOpenQuiz(false)}>Cancel</button><button className="px-3 py-2 rounded-xl bg-emerald-600 text-white" onClick={createQuiz}>Create</button></div>
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
            </div>
            <div className="mt-4 flex justify-end gap-2"><button className="px-3 py-2 rounded-xl border" onClick={() => setOpenTask(false)}>Cancel</button><button className="px-3 py-2 rounded-xl bg-blue-600 text-white" onClick={createTask}>Create</button></div>
          </div>
        </div>
      ) : null}
    </TeacherShell>
  );
}
