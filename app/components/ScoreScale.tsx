"use client";

export default function ScoreScale({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-parchment-dim/20">
      <span className="font-body text-sm text-parchment">{label}</span>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} de ${max}`}
            onClick={() => onChange(n)}
            className="star-btn w-6 h-6 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill={n <= value ? "#D4A857" : "none"}
              stroke={n <= value ? "#D4A857" : "#8A7A63"}
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="9" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
