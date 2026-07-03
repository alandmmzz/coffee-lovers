"use client";

import { useState } from "react";
import { Info, type LucideIcon } from "lucide-react";

export default function ScoreScale({
  label,
  description,
  value,
  onChange,
  max = 5,
  color = "#D4A857",
  icon: Icon,
}: {
  label: string;
  description?: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  color?: string;
  icon?: LucideIcon;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="py-2.5 border-b border-parchment-dim/20">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 font-body text-sm text-parchment">
          {Icon && <Icon size={14} style={{ color }} />}
          {label}
          {description && (
            <button
              type="button"
              onClick={() => setShowInfo((s) => !s)}
              aria-label={`Qué significa ${label}`}
              aria-expanded={showInfo}
              className="text-parchment-dim/60 hover:text-crema transition-colors"
            >
              <Info size={13} />
            </button>
          )}
        </span>
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
                fill={n <= value ? color : "none"}
                stroke={n <= value ? color : "#8A7A63"}
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      {showInfo && description && (
        <p className="font-body text-xs text-parchment-dim mt-1.5 max-w-sm">{description}</p>
      )}
    </div>
  );
}
