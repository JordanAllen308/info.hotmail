export default function TypingDots({ personaEmoji }: { personaEmoji: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-speak-blue text-base">
        {personaEmoji}
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border-2 border-speak-border bg-white px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-speak-muted [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-speak-muted [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-speak-muted" />
      </div>
    </div>
  );
}
