"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PERSONAS } from "@/lib/personas";
import { SessionData } from "@/lib/types";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/session/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.session) setSession(data.session);
        else setNotFound(true);
      });
  }, [params.id]);

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-speak-muted">Session not found.</p>
        <button className="btn-duo-green" onClick={() => router.push("/")}>
          Go home
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-speak-muted">Loading report...</p>
      </div>
    );
  }

  if (!session.report) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-speak-muted">This session hasn't been analyzed yet.</p>
        <button className="btn-duo-green" onClick={() => router.push(`/chat/${session.id}`)}>
          Back to conversation
        </button>
      </div>
    );
  }

  const persona = PERSONAS[session.persona];
  const r = session.report;

  return (
    <div className="flex flex-1 flex-col px-5 py-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="animate-pop mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-speak-yellow text-4xl shadow-card">
          🏆
        </div>
        <h1 className="text-2xl font-extrabold">Session complete!</h1>
        <p className="mt-1 text-speak-muted">
          {persona.emoji} {persona.name} · {session.scenarioTitle}
        </p>
        {session.xpEarned > 0 && (
          <div className="mt-3 rounded-full bg-speak-yellow/20 px-4 py-1.5 font-extrabold text-speak-orange">
            +{session.xpEarned} XP earned
          </div>
        )}
      </div>

      <div className="card-duo mb-4 bg-sky-50 border-speak-blue">
        <p className="text-sm font-bold text-speak-blueDark">Summary</p>
        <p className="mt-1 text-[15px]">{r.summary}</p>
      </div>

      {r.strengths.length > 0 && (
        <Section title="What you did well" icon="💪" color="border-speak-green bg-green-50">
          <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
            {r.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      )}

      {r.grammarMistakes.length > 0 && (
        <Section title="Grammar mistakes" icon="✏️" color="border-speak-red bg-red-50">
          <div className="flex flex-col gap-3">
            {r.grammarMistakes.map((m, i) => (
              <div key={i} className="rounded-xl bg-white p-3">
                <p className="text-sm">
                  <span className="text-speak-red line-through">{m.mistake}</span>
                  {" → "}
                  <span className="font-bold text-speak-greenDark">{m.correction}</span>
                </p>
                <p className="mt-1 text-xs text-speak-muted">{m.explanation}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {r.vocabSuggestions.length > 0 && (
        <Section title="Vocabulary upgrades" icon="📚" color="border-speak-purple bg-purple-50">
          <div className="flex flex-col gap-3">
            {r.vocabSuggestions.map((v, i) => (
              <div key={i} className="rounded-xl bg-white p-3">
                <p className="text-sm">
                  <span className="text-speak-muted">{v.youSaid}</span>
                  {" → "}
                  <span className="font-bold text-speak-purpleDark">{v.betterOption}</span>
                </p>
                <p className="mt-1 text-xs text-speak-muted">{v.why}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {r.fluencyObservations.length > 0 && (
        <Section title="Fluency notes" icon="🌊" color="border-speak-blue bg-sky-50">
          <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
            {r.fluencyObservations.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="card-duo mb-6 border-speak-yellow bg-amber-50">
        <p className="text-sm font-bold text-speak-orange">🎯 Focus next time</p>
        <p className="mt-1 text-[15px]">{r.focusNext}</p>
      </div>

      <button className="btn-duo-green w-full" onClick={() => router.push("/")}>
        Back to home
      </button>
    </div>
  );
}

function Section({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`card-duo mb-4 border-2 ${color}`}>
      <p className="mb-2 text-sm font-bold">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}
