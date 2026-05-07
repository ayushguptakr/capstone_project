import { getToken } from "../utils/authStorage";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout(promise, timeoutMs = 12000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

function parseResponseBody(text, contentType = "") {
  if (!text) return null;
  const looksJson = contentType.includes("application/json");
  if (looksJson) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    retries = 1,
    timeoutMs = 12000,
    isMultipart = false,
  } = options;

  const token = getToken();

  // Allow auth-related endpoints to proceed without a token
  const isPublicRoute = 
    path.includes("/login") || 
    path.includes("/signup") || 
    path.includes("/forgot-password") || 
    path.includes("/reset-password") ||
    path.includes("/check-username");

  if (!token && !isPublicRoute) {
    console.warn(`No token provided, skipping protected API call: ${path}`);
    return null; // Gracefully fail instead of throwing 401
  }

  const requestHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  if (!isMultipart && body != null && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      const response = await withTimeout(
        fetch(buildUrl(path), {
          method,
          headers: requestHeaders,
          body:
            body == null
              ? undefined
              : isMultipart
                ? body
                : typeof body === "string"
                  ? body
                  : JSON.stringify(body),
        }),
        timeoutMs
      );

      const text = await response.text();
      const contentType = response.headers.get("content-type") || "";
      const data = parseResponseBody(text, contentType);
      if (!response.ok) {
        const err = new Error(
          data?.message || data?.error || `Request failed (${response.status})`
        );
        err.status = response.status;
        err.payload = data;
        err.request = { path, method };
        throw err;
      }
      return data;
    } catch (error) {
      if (error.status === 429) {
        console.warn("Rate limited - stopping repeated calls");
        return null;
      }
      lastError = error;
      if (attempt === retries) break;
      await delay(250 * (attempt + 1));
    }
    attempt += 1;
  }
  throw lastError;
}

export function isFeatureDisabledError(error) {
  return (
    error?.status === 403 &&
    (error?.payload?.code === "FEATURE_DISABLED" ||
      String(error?.payload?.message || error?.message || "").toLowerCase().includes("feature"))
  );
}

