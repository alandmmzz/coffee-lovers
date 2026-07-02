"use client";

const ROAST_LEVELS = [
  { id: "light", label: "Claro", hex: "#C89B6C" },
  { id: "medium-light", label: "Medio claro", hex: "#B07F4E" },
  { id: "medium", label: "Medio", hex: "#8A5E37" },
  { id: "medium-dark", label: "Medio oscuro", hex: "#5E3C22" },
  { id: "dark", label: "Oscuro", hex: "#3A2314" },
];

export default function RoastSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex gap-2">
        {ROAST_LEVELS.map((level) => {
          const selected = value === level.id;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onChange(level.id)}
              aria-pressed={selected}
              aria-label={`Tueste ${level.label}`}
              className={`tile-roast flex-1 h-14 rounded-sm border-2 ${
                selected
                  ? "border-crema shadow-[0_0_0_3px_rgba(212,168,87,0.25)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: level.hex }}
            />
          );
        })}
      </div>
      <p className="mt-2 font-mono text-xs text-parchment-dim tracking-wide">
        {value
          ? ROAST_LEVELS.find((l) => l.id === value)?.label
          : "Elegí la muestra que más se parece al tueste"}
      </p>
    </div>
  );
}
