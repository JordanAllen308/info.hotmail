"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, Level } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [level, setLevel] = useState<Level | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setNotes((prev) => (prev ? `${prev}\n\n${text}` : text));
  }

  async function finishOnboarding() {
    if (!level) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, notes }),
      });
      if (!res.ok) throw new Error("Could not save your profile. Please try again.");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-10">
      <div className="mb-8 flex items-center gap-2">
        <span className="text-3xl">🗣️</span>
        <h1 className="text-2xl font-extrabold text-speak-ink">SpeakUp</h1>
      </div>

      {step === 1 && (
        <div className="animate-bounceIn flex flex-1 flex-col">
          <h2 className="mb-1 text-xl font-extrabold">What's your English level?</h2>
          <p className="mb-6 text-speak-muted">We'll match the conversation difficulty to you.</p>

          <div className="flex flex-col gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`card-duo flex flex-col items-start text-left transition-all ${
                  level === l.id
                    ? "border-speak-green bg-green-50 ring-2 ring-speak-green"
                    : "hover:border-speak-blue"
                }`}
              >
                <span className="text-lg font-extrabold">{l.label}</span>
                <span className="text-sm text-speak-muted">{l.description}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />
          <button
            className="btn-duo-green mb-8 mt-8 w-full"
            disabled={!level}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-bounceIn flex flex-1 flex-col">
          <h2 className="mb-1 text-xl font-extrabold">Got any study notes?</h2>
          <p className="mb-6 text-speak-muted">
            Optional — paste or upload notes from your {level} class. We'll use them as context
            in your conversations.
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste vocabulary lists, grammar notes, topics you're studying..."
            rows={8}
            className="card-duo w-full resize-none text-sm focus:border-speak-blue focus:outline-none"
          />

          <label className="btn-duo-outline mt-3 w-full cursor-pointer">
            📄 Upload a text file
            <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
          </label>

          {error && <p className="mt-4 text-sm font-semibold text-speak-red">{error}</p>}

          <div className="flex-1" />
          <div className="mb-8 mt-8 flex gap-3">
            <button className="btn-duo-outline flex-1" onClick={() => setStep(1)} disabled={saving}>
              Back
            </button>
            <button className="btn-duo-green flex-1" onClick={finishOnboarding} disabled={saving}>
              {saving ? "Saving..." : "Let's go!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
