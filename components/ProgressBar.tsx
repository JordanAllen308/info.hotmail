export default function ProgressBar({
  pct,
  colorClass = "bg-speak-green",
  trackClass = "bg-speak-border",
  height = "h-3",
}: {
  pct: number;
  colorClass?: string;
  trackClass?: string;
  height?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={`w-full overflow-hidden rounded-full ${trackClass} ${height}`}>
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
