import React from "react";
import TeacherShell from "../components/TeacherShell";

export default function TeacherSettings() {
  return (
    <TeacherShell title="Settings" subtitle="Workspace preferences and account-level controls.">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg">General</h3>
          <p className="text-sm text-slate-600">Profile and notification preferences will appear here.</p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Placeholder settings panel. Existing backend logic remains unchanged.
        </div>
      </div>
    </TeacherShell>
  );
}
