"use client";

import { useState } from "react";
import { Coffee, Droplets, Thermometer, Clock } from "lucide-react";

const INTENSITY_LEVELS = [
  { label: "Suave", ratio: 17, minutes: 3 },
  { label: "Medio-suave", ratio: 16, minutes: 3.5 },
  { label: "Medio", ratio: 15, minutes: 4 },
  { label: "Medio-fuerte", ratio: 14, minutes: 4.5 },
  { label: "Fuerte", ratio: 12, minutes: 5 },
];

const CUP_SIZE_ML = 200;
const WATER_TEMP_C = 94;

export default function FrenchPressCalculator() {
  const [intensity, setIntensity] = useState(2); // índice 0-4, arranca en "Medio"
  const [cups, setCups] = useState(4);

  const level = INTENSITY_LEVELS[intensity];
  const waterMl = cups * CUP_SIZE_ML;
  const coffeeG = Math.round(waterMl / level.ratio);
  const minutes = Math.floor(level.minutes);
  const seconds = level.minutes % 1 === 0.5 ? 30 : 0;

  return (
    <div className="space-y-8">
      {/* Intensidad */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">Intensidad</label>
          <span className="font-mono text-sm text-crema">{level.label}</span>
        </div>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-cascara"
        />
        <div className="flex justify-between font-mono text-[10px] text-parchment-dim mt-1">
          <span>Suave</span>
          <span>Fuerte</span>
        </div>
      </div>

      {/* Tazas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">Cantidad de tazas</label>
          <span className="font-mono text-sm text-crema">{cups}</span>
        </div>
        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={cups}
          onChange={(e) => setCups(Number(e.target.value))}
          className="w-full accent-cascara"
        />
        <p className="font-mono text-[10px] text-parchment-dim mt-1">
          Asumiendo tazas de {CUP_SIZE_ML} ml cada una
        </p>
      </div>

      {/* Resultado */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Coffee size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">{coffeeG}g</p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Café molido
          </p>
        </div>
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Droplets size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">{waterMl}ml</p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">Agua</p>
        </div>
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Thermometer size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">{WATER_TEMP_C}°C</p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Temperatura del agua
          </p>
        </div>
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Clock size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">
            {minutes}:{seconds === 0 ? "00" : seconds}
          </p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Tiempo de reposo
          </p>
        </div>
      </div>

      {/* Pasos */}
      <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5">
        <h3 className="font-display text-lg text-cream mb-3">Cómo prepararlo</h3>
        <ol className="space-y-2 font-body text-sm text-parchment list-decimal list-inside">
          <li>
            Molé <strong className="text-crema">{coffeeG}g</strong> de café en molienda
            gruesa (como sal gruesa o azúcar mascabo).
          </li>
          <li>Ponelo en la prensa francesa vacía.</li>
          <li>
            Calentá el agua a punto de hervor, dejala reposar unos 30 segundos, y
            volcá los <strong className="text-crema">{waterMl}ml</strong> sobre el café.
          </li>
          <li>Revolvé suave una vez, para que todo el café se moje parejo.</li>
          <li>Poné la tapa, sin bajar el émbolo todavía.</li>
          <li>
            Dejalo reposar{" "}
            <strong className="text-crema">
              {minutes} minuto{minutes === 1 ? "" : "s"}
              {seconds ? ` y ${seconds} segundos` : ""}
            </strong>
            .
          </li>
          <li>Bajá el émbolo lento y parejo, y serví enseguida para que no se pase.</li>
        </ol>
      </div>
    </div>
  );
}
