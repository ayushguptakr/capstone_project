import { apiRequest } from "./httpClient";

export async function fetchTeacherBootstrap() {
  const [analytics, verificationQueue, tasks, quizzes, announcements, schedules, badges] =
    await Promise.all([
      apiRequest("/api/teacher/analytics"),
      apiRequest("/api/teacher/verification-queue"),
      apiRequest("/api/tasks/my"),
      apiRequest("/api/quizzes"),
      apiRequest("/api/teacher/announcements?limit=25&offset=0"),
      apiRequest("/api/teacher/schedules?limit=25&offset=0"),
      apiRequest("/api/teacher/badges"),
    ]);
  return {
    analytics,
    verificationQueue,
    tasks: Array.isArray(tasks) ? tasks : tasks?.items || [],
    tasksPagination: tasks?.pagination || null,
    quizzes: Array.isArray(quizzes) ? quizzes : quizzes?.items || [],
    announcements: Array.isArray(announcements) ? announcements : announcements?.items || [],
    announcementsPagination: announcements?.pagination || null,
    schedules: Array.isArray(schedules) ? schedules : schedules?.items || [],
    schedulesPagination: schedules?.pagination || null,
    badges,
  };
}

export const verifySubmissionApi = (submissionId, payload) =>
  apiRequest(`/api/teacher/verify/${submissionId}`, { method: "PUT", body: payload, retries: 0 });

export const createScheduleApi = (payload) =>
  apiRequest("/api/teacher/schedules", { method: "POST", body: payload, retries: 0 });

export const createAnnouncementApi = (payload) =>
  apiRequest("/api/teacher/announcements", { method: "POST", body: payload, retries: 0 });

export const assignBonusXpApi = (payload) =>
  apiRequest("/api/teacher/bonus-xp", { method: "POST", body: payload, retries: 0 });

export const createCustomBadgeApi = (payload) =>
  apiRequest("/api/teacher/badges", { method: "POST", body: payload, retries: 0 });
