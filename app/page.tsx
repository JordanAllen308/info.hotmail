"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PERSONA_LIST } from "@/lib/personas";
import { ProfileData, Persona } from "@/lib/types";
import { levelProgress } from "@/lib/gamification";
import PersonaCard from "@/components/PersonaCard";
import ScenarioSheet from "@/components/ScenarioSheet";
import ProgressBar from "@/components/ProgressBar";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.profile?.onboarded) {
          router.replace("/onboarding");
          return;
        }
        setProfile(data.profile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function startSession(scenarioId: string) {
    if (!activePersona) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: activePersona.id, scenarioId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start a session.");
      router.push(`/chat/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStarting(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-speak-muted">Loading...</p>
      </div>
    );
  }

  const { progressPct } = levelProgress(profile.xp);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b-2 border-speak-border bg-speak-bg/95 px-5 pb-4 pt-6 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🗣️</span>
            <span className="text-lg font-extrabold">SpeakUp</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-sm">
              <span className="text-lg">🔥</span>
              <span className="font-extrabold text-speak-orange">{profile.streak}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-sm">
              <span className="text-lg">⭐</span>
              <span className="font-extrabold text-speak-yellow">{profile.xp}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-speak-muted">
            <span>Level {profile.level}</span>
            <span>{progressPct}% to next level</span>
          </div>
          <ProgressBar pct={progressPct} colorClass="bg-speak-green" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <h1 className="mb-1 text-xl font-extrabold">Who do you want to talk to?</h1>
        <p className="mb-5 text-speak-muted">Pick a persona and practice a real conversation.</p>

        <div className="flex flex-col gap-3">
          {PERSONA_LIST.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onClick={() => setActivePersona(persona)} />
          ))}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-speak-red">{error}</p>}
      </main>

      {activePersona && (
        <ScenarioSheet
          persona={activePersona}
          starting={starting}
          onClose={() => !starting && setActivePersona(null)}
          onSelect={startSession}
        />
      )}
    </div>
  );
}
