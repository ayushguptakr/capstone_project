import { useState, useRef, useCallback, useMemo } from "react";

/**
 * Unified Progression Engine — Single Source of Truth.
 *
 * Computes ALL derived metrics from raw user data and exposes
 * state diffs for animation triggers. Every component consumes
 * this shared state instead of computing its own.
 */
export default function useProgressionEngine({
  user,
  progress,
  meProfile,
  gamificationSummary,
  streak,
  recommendations,
  missionsDone,
}) {
  // ── Previous-state tracking for diffs ──
  const prevRef = useRef({
    points: 0,
    rank: null,
    streak: 0,
    levelNum: 1,
    league: "bronze",
  });

  // Track whether system has completed first hydration
  const [hydrated, setHydrated] = useState(false);

  // ── Raw metrics (single source) ──
  const points =
    progress?.student?.points ??
    gamificationSummary?.points ??
    meProfile?.points ??
    user?.points ??
    0;

  const weeklyXP =
    progress?.student?.weeklyXP ??
    meProfile?.weeklyXP ??
    user?.weeklyXP ??
    0;

  const league =
    progress?.student?.league ??
    meProfile?.league ??
    user?.league ??
    "bronze";

  const rank = progress?.student?.rank ?? null;

  const levelNum =
    progress?.student?.level != null && progress.student.level > 0
      ? progress.student.level
      : meProfile?.level != null && meProfile.level > 0
        ? meProfile.level
        : Math.max(1, Math.floor(points / 100) + 1);

  const lastActiveIso =
    gamificationSummary?.lastActivityAt ??
    meProfile?.lastActivityAt ??
    user?.lastActivityAt ??
    null;

  // ── Derived computations ──
  const nextLevelFloor = (levelNum - 1) * 100;
  const nextLevelCeil = levelNum * 100;
  const xpToNext = Math.max(0, nextLevelCeil - points);
  const pct = Math.max(
    0,
    Math.min(
      100,
      ((points - nextLevelFloor) / Math.max(1, nextLevelCeil - nextLevelFloor)) * 100
    )
  );

  const ecoScore = useMemo(() => {
    let score = 0;
    score += Math.min((streak || 0) * 5, 30);
    score += Math.min(missionsDone * 10, 40);
    score += Math.max(0, Math.min(100, pct)) * 0.3;
    return Math.min(100, Math.round(score));
  }, [streak, missionsDone, pct]);

  // ── Streak risk detection ──
  const streakAtRisk = useMemo(() => {
    if (streak === 0) return false;
    if (!lastActiveIso) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(lastActiveIso) < today;
  }, [streak, lastActiveIso]);

  // ── Plant stage ──
  const plantStage = useMemo(() => {
    if (streak === 0) return "seed";
    if (streak < 3) return "sprout";
    if (streak < 7) return "growing";
    return "tree";
  }, [streak]);

  // ── Sprouty message context ──
  const sproutyContext = useMemo(() => {
    if (streakAtRisk) return "Your streak needs attention today";
    
    const prev = prevRef.current;
    if (rank !== null && prev.rank !== null && prev.rank > rank)
      return "You're climbing the ranks fast!";

    if (league !== prev.league && hydrated) return "Push a bit more to level up your league!";

    if (recommendations.length > 0) return "One mission left to level up";
    if (streak > 5) return "You're building strong eco habits";
    return "You're on track today";
  }, [streakAtRisk, rank, league, recommendations, streak, hydrated]);

  // ── State diffs (for animation triggers) ──
  const diffs = useMemo(() => {
    const prev = prevRef.current;
    const xpChange = points - prev.points;
    const rankChange = prev.rank != null && rank != null ? prev.rank - rank : 0;
    const leveledUp = levelNum > prev.levelNum;
    const streakGained = streak > prev.streak;
    const leagueChanged = league !== prev.league && hydrated;
    const plantChanged = plantStage !== (() => {
      if (prev.streak === 0) return "seed";
      if (prev.streak < 3) return "sprout";
      if (prev.streak < 7) return "growing";
      return "tree";
    })();

    return {
      xpChange: Math.max(0, xpChange),
      rankChange,
      rankJumped: rankChange >= 2,
      leveledUp,
      streakGained,
      leagueChanged,
      plantChanged,
    };
  }, [points, rank, levelNum, streak, league, plantStage, hydrated]);

  // ── Snapshot current state as "previous" for next cycle ──
  const commitState = useCallback(() => {
    prevRef.current = {
      points,
      rank,
      streak,
      levelNum,
      league,
    };
    if (!hydrated) setHydrated(true);
  }, [points, rank, streak, levelNum, league, hydrated]);

  return {
    // Raw values
    points,
    weeklyXP,
    league,
    rank,
    levelNum,
    xpToNext,
    pct,
    ecoScore,
    lastActiveIso,
    missionsPending: recommendations.length,

    // Derived states
    streakAtRisk,
    plantStage,
    sproutyContext,

    // Animation triggers
    diffs,
    commitState,
    hydrated,
  };
}
