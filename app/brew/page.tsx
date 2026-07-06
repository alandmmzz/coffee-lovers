"use client";

import { useState } from "react";
import { Coffee, Droplet, Zap, Wind, Snowflake, MoreHorizontal } from "lucide-react";
import FrenchPressCalculator from "../components/FrenchPressCalculator";

const METHODS = [
  { id: "prensa", label: "Prensa francesa", icon: Coffee, available: true },
  { id: "v60", label: "V60 / Filtrado", icon: Droplet, available: false },
  { id: "espresso", label: "Espresso", icon: Zap, available: false },
  { id: "aeropress", label: "Aeropress", icon: Wind, available: false },
  { id: "cold", label: "Cold brew", icon: Snowflake, available: false },
  { id: "otro", label: "Más métodos", icon: MoreHorizontal, available: false },
];

export default function BrewPage() {
  const [method, setMethod] = useState("prensa");

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers
          </p>
          <h1 className="font-display text-4xl text-cream leading-[1.05] mb-3">
            Preparar tu café
          </h1>
          <p className="font-body text-parchment-dim text-sm max-w-md">
            Elegí el método y ajustá la intensidad y la cantidad de tazas —
            calculamos la proporción de café, agua, temperatura y tiempo.
          </p>
        </header>

        <div className="grid grid-cols-3 gap-2 mb-10">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const selected = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={!m.available}
                onClick={() => setMethod(m.id)}
                className={`relative flex flex-col items-center gap-1.5 py-4 rounded-sm border transition-colors ${
                  !m.available
                    ? "border-parchment-dim/10 opacity-40 cursor-not-allowed"
                    : selected
                    ? "border-crema bg-crema/10"
                    : "border-parchment-dim/15 bg-parchment/[0.04] hover:border-parchment-dim/40"
                }`}
              >
                <Icon size={18} className={selected ? "text-crema" : "text-parchment-dim"} />
                <span
                  className={`font-mono text-[11px] text-center leading-tight ${
                    selected ? "text-crema" : "text-parchment"
                  }`}
                >
                  {m.label}
                </span>
                {!m.available && (
                  <span className="absolute top-1 right-1 font-mono text-[8px] text-parchment-dim uppercase">
                    Pronto
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {method === "prensa" && <FrenchPressCalculator />}
      </div>
    </main>
  );
}
