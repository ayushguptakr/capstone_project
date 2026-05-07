import React from "react";

function isDebugEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const v = localStorage.getItem("ecoquest:debug");
    return v === "1" || v === "true";
  } catch {
    return false;
  }
}

export default function MiniGameDebugPanel({ gameId, level, run, submitting, submitResult }) {
  if (!isDebugEnabled()) return null;

  return (
    <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-700">
      <div className="font-bold mb-1">Debug Panel</div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div>Game: <span className="font-mono">{gameId}</span></div>
        <div>Level: <span className="font-mono">{level}</span></div>
        <div>Submitting: <span className="font-mono">{String(submitting)}</span></div>
        <div>Run ID: <span className="font-mono">{run?.runId || "none"}</span></div>
      </div>
      <pre className="mt-2 overflow-auto rounded bg-white p-2 border border-slate-200">
{JSON.stringify({ run, submitResult }, null, 2)}
      </pre>
    </div>
  );
}
