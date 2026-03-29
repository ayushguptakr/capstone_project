import { apiRequest } from "./httpClient";

export async function fetchGamificationMe({ limit = 20, offset = 0, source } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (source) params.set("source", source);
  return apiRequest(`/api/gamification/me?${params.toString()}`, { retries: 1 });
}

export async function syncGamificationActivity(activityAt) {
  return apiRequest("/api/gamification/sync-activity", {
    method: "POST",
    body: { activityAt: activityAt || new Date().toISOString() },
    retries: 0,
  });
}
