import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { levelProgress } from "@/lib/gamification";

export async function GET() {
  const profile = await prisma.profile.findFirst({ orderBy: { id: "asc" } });

  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const [sessionsThisWeek, sessionsLastWeek, topMistakes, allCompletedSessions] = await Promise.all([
    prisma.session.count({
      where: { status: "completed", completedAt: { gte: startOfThisWeek } },
    }),
    prisma.session.count({
      where: { status: "completed", completedAt: { gte: startOfLastWeek, lt: startOfThisWeek } },
    }),
    prisma.mistake.findMany({
      orderBy: [{ occurrences: "desc" }, { lastSeenAt: "desc" }],
      take: 3,
    }),
    prisma.session.findMany({
      where: { status: "completed" },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true, report: true },
    }),
  ]);

  // Improvement trend: compare avg mistakes/session in the earlier half vs later half of sessions
  const mistakeCounts = allCompletedSessions.map((s) => {
    if (!s.report) return 0;
    try {
      const r = JSON.parse(s.report);
      return (r.grammarMistakes?.length ?? 0) + (r.vocabSuggestions?.length ?? 0);
    } catch {
      return 0;
    }
  });

  let trend: "improving" | "steady" | "not-enough-data" = "not-enough-data";
  if (mistakeCounts.length >= 4) {
    const mid = Math.floor(mistakeCounts.length / 2);
    const firstHalfAvg = average(mistakeCounts.slice(0, mid));
    const secondHalfAvg = average(mistakeCounts.slice(mid));
    trend = secondHalfAvg < firstHalfAvg - 0.3 ? "improving" : "steady";
  }

  const progress = profile ? levelProgress(profile.xp) : { levelIndex: 0, progressPct: 0, xpIntoLevel: 0 };

  return NextResponse.json({
    profile,
    sessionsThisWeek,
    sessionsLastWeek,
    totalCompletedSessions: allCompletedSessions.length,
    topMistakes,
    trend,
    progress,
  });
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
