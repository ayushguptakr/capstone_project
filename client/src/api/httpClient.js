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
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) {
        const err = new Error(data?.message || `Request failed (${response.status})`);
        err.status = response.status;
        err.payload = data;
        throw err;
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await delay(250 * (attempt + 1));
    }
    attempt += 1;
  }
  throw lastError;
}

