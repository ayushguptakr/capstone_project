const getStorage = () => {
  if (localStorage.getItem("eco_auth")) return localStorage;
  if (sessionStorage.getItem("eco_auth")) return sessionStorage;
  return null;
};

/** Read user from localStorage (set at login/signup). Strictly requires a token. */
export function getStoredUser() {
  try {
    const storage = getStorage();
    if (storage) {
      const raw = storage.getItem("eco_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt < Date.now() || !parsed.token) {
          clearAuth();
          return null;
        }
        return parsed.user && typeof parsed.user === "object" ? parsed.user : null;
      }
    }

    // Fallback for old legacy sessions
    const rawLegacy = localStorage.getItem("user");
    const legacyToken = localStorage.getItem("token");
    
    // STRICT GUARD: Must have both token and user
    if (!rawLegacy || !legacyToken) {
      if (rawLegacy || legacyToken) {
        // If we have one but not the other, the session is corrupted/stale. Clear it.
        clearAuth();
      }
      return null;
    }
    
    const u = JSON.parse(rawLegacy);
    return u && typeof u === "object" ? u : null;
  } catch {
    return null;
  }
}

export function getToken() {
  try {
    const storage = getStorage();
    if (storage) {
      const raw = storage.getItem("eco_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt < Date.now()) {
          clearAuth();
          return null;
        }
        return parsed.token;
      }
    }

    // Fallback for old legacy sessions
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function setAuthData(user, token, rememberMe) {
  const payload = {
    user,
    token,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  
  clearAuth(); // wipe old first
  if (rememberMe) {
    localStorage.setItem("eco_auth", JSON.stringify(payload));
  } else {
    sessionStorage.setItem("eco_auth", JSON.stringify(payload));
  }

  // Fallback for legacy code
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function isAuthenticated() {
  return Boolean(getToken() && getStoredUser());
}

export function clearAuth() {
  localStorage.removeItem("eco_auth");
  sessionStorage.removeItem("eco_auth");
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

/** Principal-facing features. */
export function isPrincipalRole(role) {
  return role === "principal" || role === "admin";
}

/** Admin/Developer-facing features. */
export function isAdminRole(role) {
  return role === "admin";
}
