import { LEVEL_ORDER, Level, XP_TO_NEXT_LEVEL } from "./types";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay);
}

export type StreakAction = "keep" | "increment" | "reset";

/**
 * Decides how a completed session should affect the streak.
 * Same day -> keep unchanged. Next day -> increment. Gap of 2+ days (or no prior session) -> reset to 1.
 */
export function computeStreak(lastSessionDate: Date | null, now: Date = new Date()): StreakAction {
  if (!lastSessionDate) return "reset";
  const diff = daysBetween(lastSessionDate, now);
  if (diff === 0) return "keep";
  if (diff === 1) return "increment";
  return "reset";
}

export function levelProgress(xp: number): { levelIndex: number; progressPct: number; xpIntoLevel: number } {
  const totalLevels = LEVEL_ORDER.length;
  const levelIndex = Math.min(Math.floor(xp / XP_TO_NEXT_LEVEL), totalLevels - 1);
  const xpIntoLevel = xp - levelIndex * XP_TO_NEXT_LEVEL;
  const progressPct = Math.min(100, Math.round((xpIntoLevel / XP_TO_NEXT_LEVEL) * 100));
  return { levelIndex, progressPct, xpIntoLevel };
}

export function levelLabelForIndex(i: number): Level {
  return LEVEL_ORDER[Math.min(i, LEVEL_ORDER.length - 1)];
}
