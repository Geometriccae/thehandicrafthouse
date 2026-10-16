/** Decorative botanical leaf that drifts slowly in the background. */
export function Leaf({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 140"
      className={`leaf-drift pointer-events-none absolute text-accent ${className}`}
      style={{ animationDelay: `${delay}s` }}
      fill="none"
    >
      <path
        d="M50 4C22 30 6 62 12 96c5 27 24 40 38 40s33-13 38-40C94 62 78 30 50 4Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path d="M50 12v120" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <path
        d="M50 40 24 60M50 62 22 82M50 84 26 102M50 40l26 20M50 62l28 20M50 84l24 18"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.28"
      />
    </svg>
  );
}
