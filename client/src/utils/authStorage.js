/** Read user from localStorage (set at login/signup). */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && typeof u === "object" ? u : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return Boolean(getToken() && getStoredUser());
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/** Student-facing features (includes admin/sponsor where applicable). */
export function isStudentRole(role) {
  return role === "student" || role === "admin" || role === "sponsor";
}

/** Teacher-facing features. */
export function isTeacherRole(role) {
  return role === "teacher" || role === "admin";
}
