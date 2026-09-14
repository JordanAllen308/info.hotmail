"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PERSONAS } from "@/lib/personas";
import { SessionListItem } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";

interface StatsResponse {
  profile: {
    level: string;
    xp: number;
    streak: number;
    longestStreak: number;
    onboarded: boolean;
  } | null;
  sessionsThisWeek: number;
  sessionsLastWeek: number;
  totalCompletedSessions: number;
  topMistakes: {
    id: string;
    category: string;
    description: string;
    correction: string | null;
    occurrences: number;
  }[];
  trend: "improving" | "steady" | "not-enough-data";
  progress: { levelIndex: number; progressPct: number; xpIntoLevel: number };
}

export default function ProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/sessions").then((r) => r.json()),
    ])
      .then(([statsData, sessionsData]) => {
        if (!statsData.profile?.onboarded) {
          router.replace("/onboarding");
          return;
        }
        setStats(statsData);
        setSessions(
          (sessionsData.sessions ?? []).map((s: any) => ({
            id: s.id,
            persona: s.persona,
            scenario: s.scenarioTitle,
            level: s.level,
            status: s.status,
            xpEarned: s.xpEarned,
            createdAt: s.createdAt,
            completedAt: s.completedAt,
            reportSummary: s.report?.summary ?? null,
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-speak-muted">Loading progress...</p>
      </div>
    );
  }

  const weeklyDiff = stats.sessionsThisWeek - stats.sessionsLastWeek;

  return (
    <div className="flex flex-1 flex-col px-5 py-6">
      <h1 className="mb-5 text-xl font-extrabold">Your Progress</h1>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard emoji="🔥" value={stats.profile?.streak ?? 0} label="Day streak" />
        <StatCard emoji="⭐" value={stats.profile?.xp ?? 0} label="Total XP" />
        <StatCard emoji="🏅" value={stats.profile?.longestStreak ?? 0} label="Best streak" />
      </div>

      <div className="card-duo mb-4">
        <div className="mb-1 flex items-center justify-between text-sm font-bold">
          <span>Level {stats.profile?.level}</span>
          <span className="text-speak-muted">{stats.progress.progressPct}%</span>
        </div>
        <ProgressBar pct={stats.progress.progressPct} />
      </div>

      <div className="card-duo mb-4">
        <p className="mb-3 text-sm font-bold">This week</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-extrabold text-speak-green">{stats.sessionsThisWeek}</p>
            <p className="text-xs text-speak-muted">sessions completed</p>
          </div>
          <div className="text-right">
            {stats.trend === "improving" && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-speak-greenDark">
                📈 Improving
              </span>
            )}
            {stats.trend === "steady" && (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-speak-blueDark">
                Steady progress
              </span>
            )}
            {stats.trend === "not-enough-data" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-speak-muted">
                Keep going!
              </span>
            )}
            <p className="mt-1 text-xs text-speak-muted">
              {weeklyDiff > 0 ? `+${weeklyDiff}` : weeklyDiff} vs last week
            </p>
          </div>
        </div>
      </div>

      <div className="card-duo mb-4">
        <p className="mb-3 text-sm font-bold">Top recurring mistakes</p>
        {stats.topMistakes.length === 0 ? (
          <p className="text-sm text-speak-muted">
            No recurring mistakes yet — finish a few sessions to see patterns here.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {stats.topMistakes.map((m, i) => (
              <div key={m.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-speak-red text-[10px] font-extrabold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.description}</p>
                  <p className="text-xs text-speak-muted">
                    {m.category} · seen {m.occurrences}x
                    {m.correction ? ` · try: "${m.correction}"` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="mb-3 text-sm font-bold">Session history</p>
        {sessions.length === 0 ? (
          <p className="text-sm text-speak-muted">No sessions yet. Start your first conversation!</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sessions.map((s) => {
              const persona = PERSONAS[s.persona as keyof typeof PERSONAS];
              return (
                <button
                  key={s.id}
                  onClick={() => router.push(s.status === "completed" ? `/report/${s.id}` : `/chat/${s.id}`)}
                  className="card-duo flex items-center gap-3 text-left transition-transform active:scale-[0.98]"
                >
                  <span className="text-2xl">{persona?.emoji ?? "💬"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {persona?.name} · {s.scenario}
                    </p>
                    <p className="text-xs text-speak-muted">
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      {s.status === "active" ? " · in progress" : ""}
                    </p>
                  </div>
                  {s.xpEarned > 0 && (
                    <span className="flex-shrink-0 text-xs font-extrabold text-speak-orange">
                      +{s.xpEarned} XP
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="card-duo flex flex-col items-center py-3 text-center">
      <span className="text-2xl">{emoji}</span>
      <span className="text-lg font-extrabold">{value}</span>
      <span className="text-[10px] leading-tight text-speak-muted">{label}</span>
    </div>
  );
}
