import React from "react";
import { Info } from "lucide-react";

export default function ScheduleStatusHint() {
  return (
    <div className="group relative inline-flex items-center">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
        <Info className="h-3.5 w-3.5" />
        Schedule Info
      </span>
      <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg group-hover:block">
        <div className="font-bold text-slate-700 mb-2">Availability labels</div>
        <ul className="space-y-1">
          <li><span className="font-semibold text-emerald-700">Live:</span> no schedule restriction.</li>
          <li><span className="font-semibold text-indigo-700">Scheduled:</span> currently within active window.</li>
          <li><span className="font-semibold text-blue-700">Opens Soon:</span> scheduled but start date not reached.</li>
          <li><span className="font-semibold text-rose-700">Closed:</span> schedule window already ended.</li>
        </ul>
      </div>
    </div>
  );
}
