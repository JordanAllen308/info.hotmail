"use client";

import { Persona } from "@/lib/types";

export default function ScenarioSheet({
  persona,
  onClose,
  onSelect,
  starting,
}: {
  persona: Persona;
  onClose: () => void;
  onSelect: (scenarioId: string) => void;
  starting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="animate-bounceIn w-full max-w-lg rounded-t-3xl bg-white p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-speak-border" />
        <div className="mb-5 flex items-center gap-3">
          <span className="text-3xl">{persona.emoji}</span>
          <div>
            <p className="text-lg font-extrabold">{persona.name}</p>
            <p className="text-sm text-speak-muted">Choose a scenario</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {persona.scenarios.map((s) => (
            <button
              key={s.id}
              disabled={starting}
              onClick={() => onSelect(s.id)}
              className="card-duo text-left transition-transform active:scale-[0.98] hover:border-speak-blue disabled:opacity-60"
            >
              <p className="font-extrabold">{s.title}</p>
              <p className="text-sm text-speak-muted">{s.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
