import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherShell from "../components/TeacherShell";
import { apiRequest } from "../api/httpClient";

export default function TeacherStudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiRequest(`/api/teacher/students/${studentId}/profile`);
        if (!mounted) return;
        setProfile(data);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load student profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const student = profile?.student;

  return (
    <TeacherShell title="Student Profile" subtitle="Detailed student progress, submissions, and quiz performance.">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <button
          onClick={() => navigate("/teacher/students")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Back to Students
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading profile...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 font-semibold">{error}</div>
      ) : (
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-display font-bold text-lg">{student?.name || "Student"}</h3>
              <p className="text-sm text-slate-600 mt-1">{student?.email || "No email"}</p>
              <div className="mt-3 text-sm text-slate-700 space-y-1">
                <p><span className="font-semibold">Class:</span> {`${student?.class || student?.className || "N/A"}${student?.section || ""}`}</p>
                <p><span className="font-semibold">XP:</span> {student?.points || 0}</p>
                <p><span className="font-semibold">Level:</span> {student?.level || Math.max(1, Math.floor((student?.points || 0) / 100) + 1)}</p>
                <p><span className="font-semibold">Badges:</span> {student?.badges?.length || 0}</p>
                <p><span className="font-semibold">Streak:</span> {student?.streakCurrent || 0} days</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="font-display font-bold mb-2">Quiz Stats</h4>
              <p className="text-sm text-slate-700">Attempts: {profile?.quizStats?.totalAttempts || 0}</p>
              <p className="text-sm text-slate-700">Average: {Math.round(profile?.quizStats?.avgPercentage || 0)}%</p>
              <p className="text-sm text-slate-700">Best: {Math.round(profile?.quizStats?.bestPercentage || 0)}%</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="font-display font-bold mb-2">Submission Stats</h4>
              <p className="text-sm text-slate-700">Total: {profile?.submissionStats?.total || 0}</p>
              <p className="text-sm text-slate-700">Approved: {profile?.submissionStats?.approved || 0}</p>
              <p className="text-sm text-slate-700">Pending: {profile?.submissionStats?.pending || 0}</p>
              <p className="text-sm text-slate-700">Rejected: {profile?.submissionStats?.rejected || 0}</p>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-3 border-b border-slate-100 font-display font-bold">Recent Submissions</div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left p-3">Task</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(profile?.recentSubmissions || []).map((s) => (
                    <tr key={s._id} className="border-t border-slate-100">
                      <td className="p-3">{s.task?.title || "Task"}</td>
                      <td className="p-3 capitalize">{s.status || "pending"}</td>
                      <td className="p-3">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(profile?.recentSubmissions || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500">No submissions yet.</div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-3 border-b border-slate-100 font-display font-bold">Recent Quiz Attempts</div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left p-3">Quiz</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Score</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(profile?.recentAttempts || []).map((a) => (
                    <tr key={a._id} className="border-t border-slate-100">
                      <td className="p-3">{a.quiz?.title || "Quiz"}</td>
                      <td className="p-3">{a.quiz?.category || "-"}</td>
                      <td className="p-3">{Math.round(a.percentage || 0)}%</td>
                      <td className="p-3">{new Date(a.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(profile?.recentAttempts || []).length === 0 ? (
                <div className="p-6 text-center text-slate-500">No quiz attempts yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </TeacherShell>
  );
}
