import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/httpClient";

export default function useMiniGameRun({ gameId, level = 1 }) {
  const [runNonce, setRunNonce] = useState(0);
  const [run, setRun] = useState(null);
  const [runStartedAt, setRunStartedAt] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    submittedRef.current = false;
    setSubmitResult(null);
    setRun(null);
    setRunStartedAt(null);

    apiRequest("/api/mini-games/start-run", {
      method: "POST",
      body: { gameId, level },
      retries: 0,
    })
      .then((data) => {
        if (cancelled) return;
        setRun(data || null);
        setRunStartedAt(Date.now());
      })
      .catch(() => {
        if (!cancelled) {
          setRun(null);
          setRunStartedAt(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, level, runNonce]);

  const submitScore = useCallback(
    async ({ score, timeSpent }) => {
      if (submittedRef.current || submitting) return submitResult;
      if (!run?.runId || !run?.runToken) return null;
      setSubmitting(true);
      try {
        const computedTimeSpent =
          typeof timeSpent === "number"
            ? timeSpent
            : runStartedAt
              ? Math.max(0, Math.floor((Date.now() - runStartedAt) / 1000))
              : 0;

        const resp = await apiRequest("/api/mini-games/submit-score", {
          method: "POST",
          body: {
            gameId,
            level,
            score,
            timeSpent: computedTimeSpent,
            runId: run.runId,
            runToken: run.runToken,
          },
          retries: 0,
        });
        submittedRef.current = true;
        const normalized =
          resp && typeof resp === "object"
            ? {
                ...resp,
                // Backend uses pointsEarned; UI modal expects xpEarned.
                xpEarned: Number(resp.xpEarned ?? resp.pointsEarned ?? 0),
              }
            : resp || null;
        setSubmitResult(normalized || null);
        return normalized || null;
      } catch {
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [gameId, level, run, runStartedAt, submitting, submitResult]
  );

  const restartRun = useCallback(() => {
    submittedRef.current = false;
    setSubmitResult(null);
    setRun(null);
    setRunStartedAt(null);
    setRunNonce((n) => n + 1);
  }, []);

  return {
    run,
    runStartedAt,
    submitResult,
    submitting,
    submitScore,
    restartRun,
  };
}
