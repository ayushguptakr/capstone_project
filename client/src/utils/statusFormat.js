export function formatSubmissionStatus(status) {
  const key = String(status || "pending").toLowerCase();
  const map = {
    pending: { label: "Pending Review", tone: "amber" },
    approved: { label: "Approved", tone: "emerald" },
    rejected: { label: "Needs Revision", tone: "rose" },
  };
  return map[key] || { label: "Pending Review", tone: "amber" };
}

export function formatRedemptionStatus(status) {
  const key = String(status || "pending").toLowerCase();
  const map = {
    pending: { label: "Pending Approval", tone: "amber", helper: "Your request is in queue." },
    approved: { label: "Approved", tone: "blue", helper: "Reward approved and being prepared." },
    delivered: { label: "Delivered", tone: "emerald", helper: "Reward has been fulfilled." },
    cancelled: { label: "Cancelled", tone: "rose", helper: "Request was cancelled. Points may be refunded." },
  };
  return map[key] || map.pending;
}

export function toneClasses(tone) {
  const tones = {
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return tones[tone] || tones.amber;
}

