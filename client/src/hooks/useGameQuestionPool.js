import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../api/httpClient";

function shuffle(arr, seed = 1) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i -= 1) {
    // xorshift-ish
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fetches a large pool of quiz questions for a session.
 * Uses AI endpoint when available, with fallback to local questions.
 */
export default function useGameQuestionPool({
  topic = "environment",
  level = 1,
  desiredCount = 18,
  fallback = [],
}) {
  const [pool, setPool] = useState(Array.isArray(fallback) ? fallback : []);
  const [loading, setLoading] = useState(true);
  const usedIdsRef = useRef(new Set());

  const seed = useMemo(() => {
    const now = new Date();
    // stable per day + level + topic
    const dayKey = `${now.getUTCFullYear()}${now.getUTCMonth() + 1}${now.getUTCDate()}`;
    let h = 2166136261;
    const str = `${dayKey}:${topic}:${level}`;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h | 0;
  }, [topic, level]);

  useEffect(() => {
    let cancelled = false;
    usedIdsRef.current = new Set();
    setLoading(true);

    const run = async () => {
      try {
        const res = await apiRequest("/api/ai/game-questions", {
          method: "POST",
          body: { topic, level, count: desiredCount, exclude: [] },
          retries: 0,
          timeoutMs: 9000,
        });
        const list = Array.isArray(res?.questions) ? res.questions : [];
        const merged = list.length ? list : (Array.isArray(fallback) ? fallback : []);
        if (!cancelled) setPool(shuffle(merged, seed));
      } catch {
        if (!cancelled) setPool(shuffle(Array.isArray(fallback) ? fallback : [], seed));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [topic, level, desiredCount, seed, fallback]);

  const nextQuestion = useCallback(() => {
    if (!Array.isArray(pool) || pool.length === 0) return null;
    // try to avoid repeats; fall back to any item
    for (let i = 0; i < pool.length; i += 1) {
      const q = pool[i];
      const id = String(q?.id || "");
      if (id && !usedIdsRef.current.has(id)) {
        usedIdsRef.current.add(id);
        return q;
      }
    }
    // all used, reshuffle and restart
    usedIdsRef.current = new Set();
    const reshuffled = shuffle(pool, seed ^ Date.now());
    setPool(reshuffled);
    const q0 = reshuffled[0] || null;
    if (q0?.id) usedIdsRef.current.add(String(q0.id));
    return q0;
  }, [pool, seed]);

  return { pool, loading, nextQuestion };
}

