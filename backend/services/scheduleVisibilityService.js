const ScheduledContent = require("../models/ScheduledContent");

function isWindowActive(schedule, now = new Date()) {
  if (!schedule) return true;
  const start = schedule.startDate ? new Date(schedule.startDate).getTime() : null;
  const end = schedule.endDate ? new Date(schedule.endDate).getTime() : null;
  const nowTs = now.getTime();
  if (start && nowTs < start) return false;
  if (end && nowTs > end) return false;
  return true;
}

function getScheduleState(schedule, now = new Date()) {
  if (!schedule) {
    return {
      status: "unscheduled",
      label: "Live",
      startDate: null,
      endDate: null,
    };
  }
  const start = schedule.startDate ? new Date(schedule.startDate).getTime() : null;
  const end = schedule.endDate ? new Date(schedule.endDate).getTime() : null;
  const nowTs = now.getTime();
  if (start && nowTs < start) {
    return {
      status: "upcoming",
      label: "Opens Soon",
      startDate: schedule.startDate || null,
      endDate: schedule.endDate || null,
    };
  }
  if (end && nowTs > end) {
    return {
      status: "closed",
      label: "Closed",
      startDate: schedule.startDate || null,
      endDate: schedule.endDate || null,
    };
  }
  return {
    status: "active",
    label: "Scheduled",
    startDate: schedule.startDate || null,
    endDate: schedule.endDate || null,
  };
}

async function listStudentSchedules(type, schoolId) {
  return ScheduledContent.find({
    type,
    visibility: "students",
    ...(schoolId ? { schoolId } : {}),
  })
    .select("title contentId startDate endDate")
    .lean();
}

function buildScheduleMatcher(schedules) {
  const byId = new Map();
  const byTitle = new Map();
  schedules.forEach((s) => {
    if (s.contentId) byId.set(String(s.contentId), s);
    const key = String(s.title || "").trim().toLowerCase();
    if (key && !byTitle.has(key)) byTitle.set(key, s);
  });
  return (content) => {
    const idKey = String(content?._id || "");
    if (idKey && byId.has(idKey)) return byId.get(idKey);
    const titleKey = String(content?.title || "").trim().toLowerCase();
    if (titleKey && byTitle.has(titleKey)) return byTitle.get(titleKey);
    return null;
  };
}

module.exports = {
  isWindowActive,
  getScheduleState,
  listStudentSchedules,
  buildScheduleMatcher,
};
