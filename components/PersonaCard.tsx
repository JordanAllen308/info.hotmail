import { Persona } from "@/lib/types";

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; chip: string }> = {
  green: { bg: "bg-green-50", border: "border-speak-green", text: "text-speak-greenDark", chip: "bg-speak-green" },
  blue: { bg: "bg-sky-50", border: "border-speak-blue", text: "text-speak-blueDark", chip: "bg-speak-blue" },
  purple: { bg: "bg-purple-50", border: "border-speak-purple", text: "text-speak-purpleDark", chip: "bg-speak-purple" },
  red: { bg: "bg-red-50", border: "border-speak-red", text: "text-speak-red", chip: "bg-speak-red" },
  yellow: { bg: "bg-amber-50", border: "border-speak-yellow", text: "text-speak-orange", chip: "bg-speak-yellow" },
};

export default function PersonaCard({ persona, onClick }: { persona: Persona; onClick: () => void }) {
  const style = COLOR_STYLES[persona.color] ?? COLOR_STYLES.green;
  return (
    <button
      onClick={onClick}
      className={`card-duo flex items-center gap-4 text-left transition-transform active:scale-[0.98] ${style.bg} border-2`}
    >
      <div
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl ${style.chip}`}
      >
        <span className="drop-shadow-sm">{persona.emoji}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-extrabold text-speak-ink">{persona.name}</p>
        <p className="truncate text-sm text-speak-muted">{persona.tagline}</p>
      </div>
      <span className={`text-xl ${style.text}`}>›</span>
    </button>
  );
}
