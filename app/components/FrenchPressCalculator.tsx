"use client";

import { useState } from "react";
import { Coffee, Droplets, Thermometer, Clock, Minus, Plus, Info, CheckCircle2, HelpCircle, Layers } from "lucide-react";

const INTENSITY_LEVELS = [
  { label: "Suave", ratio: 17, minutes: 3 },
  { label: "Medio-suave", ratio: 16, minutes: 3.5 },
  { label: "Medio", ratio: 15, minutes: 4 },
  { label: "Medio-fuerte", ratio: 14, minutes: 4.5 },
  { label: "Fuerte", ratio: 12, minutes: 5 },
];

// Tamaños comerciales más comunes de prensa francesa. Si la tuya no está
// en la lista, usá "Otra medida" y escribí los ml exactos.
const PRESS_SIZES = [
  { label: "350 ml", ml: 350 },
  { label: "600 ml", ml: 600 },
  { label: "800 ml", ml: 800 },
  { label: "1000 ml", ml: 1000 },
  { label: "1500 ml", ml: 1500 },
];

// Tamaños de taza domésticos "oficiales" (no el de cafetera eléctrica,
// que es más chico). En Latinoamérica la taza de mesa ronda 200-250ml.
const CUP_SIZES = [
  { label: "Chica", ml: 150 },
  { label: "Media", ml: 200 },
  { label: "Grande", ml: 250 },
];

const MEASURE_MODES = [
  { id: "prensa", label: "Por prensa" },
  { id: "tazas", label: "Por tazas" },
] as const;

const WATER_TEMP_C = 94;

export default function FrenchPressCalculator() {
  const [intensity, setIntensity] = useState(2); // índice 0-4, arranca en "Medio"
  const [measureMode, setMeasureMode] = useState<"prensa" | "tazas">("prensa");
  const [cups, setCups] = useState(4);
  const [cupSize, setCupSize] = useState<number>(CUP_SIZES[1].ml); // arranca en "Media"
  const [numPresses, setNumPresses] = useState(1);
  const [alreadyGround, setAlreadyGround] = useState<boolean | null>(null);
  const [pressSize, setPressSize] = useState<number>(1000);
  const [customSize, setCustomSize] = useState("");
  const [showTempInfo, setShowTempInfo] = useState(false);

  const level = INTENSITY_LEVELS[intensity];
  const effectivePressSize = customSize ? Number(customSize) || 0 : pressSize;

  // "Por prensa": el usuario dice cuántas prensas llenas quiere, así que
  // cada tanda es la prensa completa y no hace falta estimar tazas.
  // "Por tazas": el usuario dice cuántas tazas quiere, y de ahí derivamos
  // cuántas tandas de prensa hacen falta.
  const totalWaterMl =
    measureMode === "prensa" ? effectivePressSize * numPresses : cups * cupSize;
  const totalCoffeeG = Math.round(totalWaterMl / level.ratio);
  const minutes = Math.floor(level.minutes);
  const seconds = level.minutes % 1 === 0.5 ? 30 : 0;

  const batches =
    measureMode === "prensa"
      ? numPresses
      : effectivePressSize > 0
      ? Math.max(1, Math.ceil(totalWaterMl / effectivePressSize))
      : 1;
  const perBatchWaterMl = Math.round(totalWaterMl / batches);
  const perBatchCoffeeG = Math.round(perBatchWaterMl / level.ratio);

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

      {/* Modo de medición */}
      <div>
        <label className="field-label mb-2">¿Cómo querés calcularlo?</label>
        <div className="grid grid-cols-2 gap-2">
          {MEASURE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMeasureMode(m.id)}
              aria-pressed={measureMode === m.id}
              className={`py-3 rounded-sm border font-mono text-xs transition-colors ${
                measureMode === m.id
                  ? "border-crema bg-crema/10 text-crema"
                  : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {measureMode === "prensa" ? (
        /* Por prensa — decís cuántas prensas llenas querés, sin adivinar tazas */
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <label className="field-label mb-3">Cantidad de prensas</label>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setNumPresses((n) => Math.max(1, n - 1))}
              aria-label="Restar una prensa"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono text-3xl text-cream">{numPresses}</span>
            <button
              type="button"
              onClick={() => setNumPresses((n) => Math.min(10, n + 1))}
              aria-label="Sumar una prensa"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="font-mono text-[10px] text-parchment-dim mt-3 text-center">
            Cada prensa se llena hasta el tope elegido abajo
          </p>
        </div>
      ) : (
        /* Por tazas — tazas de mesa (200-250ml), no las de cafetera eléctrica */
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <label className="field-label mb-3">Cantidad de tazas</label>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCups((c) => Math.max(1, c - 1))}
              aria-label="Restar una taza"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono text-3xl text-cream">{cups}</span>
            <button
              type="button"
              onClick={() => setCups((c) => Math.min(20, c + 1))}
              aria-label="Sumar una taza"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {CUP_SIZES.map((c) => (
              <button
                key={c.ml}
                type="button"
                onClick={() => setCupSize(c.ml)}
                aria-pressed={cupSize === c.ml}
                className={`py-2 rounded-sm border font-mono text-xs transition-colors ${
                  cupSize === c.ml
                    ? "border-crema bg-crema/10 text-crema"
                    : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
                }`}
              >
                {c.label}
                <span className="block text-[9px] opacity-70">{c.ml} ml</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ¿Ya está molido? */}
      <div>
        <label className="field-label mb-2">¿Tu café ya está molido para prensa?</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAlreadyGround(true)}
            aria-pressed={alreadyGround === true}
            className={`flex items-center justify-center gap-2 py-3 rounded-sm border transition-colors ${
              alreadyGround === true
                ? "border-crema bg-crema/10 text-crema"
                : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
            }`}
          >
            <CheckCircle2 size={16} />
            <span className="font-mono text-xs">Sí, ya está molido</span>
          </button>
          <button
            type="button"
            onClick={() => setAlreadyGround(false)}
            aria-pressed={alreadyGround === false}
            className={`flex items-center justify-center gap-2 py-3 rounded-sm border transition-colors ${
              alreadyGround === false
                ? "border-crema bg-crema/10 text-crema"
                : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
            }`}
          >
            <HelpCircle size={16} />
            <span className="font-mono text-xs">No, tengo que molerlo</span>
          </button>
        </div>
      </div>

      {/* Tamaño de la prensa */}
      <div>
        <label className="field-label mb-2">Tamaño de tu prensa francesa</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {PRESS_SIZES.map((p) => (
            <button
              key={p.ml}
              type="button"
              onClick={() => {
                setPressSize(p.ml);
                setCustomSize("");
              }}
              aria-pressed={!customSize && pressSize === p.ml}
              className={`py-2.5 rounded-sm border font-mono text-xs transition-colors ${
                !customSize && pressSize === p.ml
                  ? "border-crema bg-crema/10 text-crema"
                  : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          className="input-field"
          placeholder="Otra medida en ml (ej: 450)"
        />
      </div>

      {/* Aviso de tandas: en modo tazas, avisa si la prensa no alcanza. En
          modo prensa, confirma cuántas veces se va a llenar (ya elegido). */}
      {measureMode === "tazas" && batches > 1 && (
        <div className="flex items-start gap-3 bg-crema/10 border border-crema/30 rounded-sm p-4">
          <Layers size={18} className="text-crema shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm text-crema">
              Con una prensa de {effectivePressSize}ml vas a necesitar{" "}
              <strong>{batches} tandas</strong> para llegar a {cups} tazas.
            </p>
            <p className="font-mono text-[11px] text-parchment-dim mt-1">
              Por tanda: {perBatchCoffeeG}g de café y {perBatchWaterMl}ml de agua.
            </p>
          </div>
        </div>
      )}

      {measureMode === "prensa" && numPresses > 1 && (
        <div className="flex items-start gap-3 bg-crema/10 border border-crema/30 rounded-sm p-4">
          <Layers size={18} className="text-crema shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm text-crema">
              Vas a llenar la prensa de {effectivePressSize}ml{" "}
              <strong>{numPresses} veces</strong>.
            </p>
            <p className="font-mono text-[11px] text-parchment-dim mt-1">
              Por prensa: {perBatchCoffeeG}g de café y {perBatchWaterMl}ml de agua.
            </p>
          </div>
        </div>
      )}

      {/* Resultado */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Coffee size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">
            {batches > 1 ? perBatchCoffeeG : totalCoffeeG}g
          </p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Café molido{batches > 1 ? " (por tanda)" : ""}
          </p>
        </div>
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Droplets size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">
            {batches > 1 ? perBatchWaterMl : totalWaterMl}ml
          </p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Agua{batches > 1 ? " (por tanda)" : ""}
          </p>
        </div>
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Thermometer size={16} className="text-crema" />
            <button
              type="button"
              onClick={() => setShowTempInfo((s) => !s)}
              aria-label="Qué pasa si cambio la temperatura"
              className="text-parchment-dim/60 hover:text-crema transition-colors"
            >
              <Info size={12} />
            </button>
          </div>
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

      {showTempInfo && (
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4 -mt-4">
          <p className="font-body text-xs text-parchment-dim leading-relaxed">
            <strong className="text-crema">Más caliente</strong> (agua recién hervida, ~100°C):
            extrae más rápido y saca sabores amargos y ásperos de más.{" "}
            <strong className="text-crema">Más fría</strong> (por debajo de 90°C): extrae de
            menos, el café queda plano, más ácido y con poco cuerpo. Por eso {WATER_TEMP_C}°C
            (agua hervida que reposó unos 30 segundos) es el punto justo para prensa francesa.
          </p>
        </div>
      )}

      {/* Pasos */}
      <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5">
        <h3 className="font-display text-lg text-cream mb-3">Cómo prepararlo</h3>
        <ol className="space-y-2 font-body text-sm text-parchment list-decimal list-inside">
          {alreadyGround ? (
            <li>
              Usá <strong className="text-crema">{batches > 1 ? perBatchCoffeeG : totalCoffeeG}g</strong>{" "}
              de tu café ya molido.
            </li>
          ) : (
            <li>
              Molé <strong className="text-crema">{batches > 1 ? perBatchCoffeeG : totalCoffeeG}g</strong>{" "}
              de café en molienda gruesa (como sal gruesa o azúcar mascabo).
            </li>
          )}
          <li>Ponelo en la prensa francesa vacía.</li>
          <li>
            Calentá el agua a punto de hervor, dejala reposar unos 30 segundos, y volcá{" "}
            <strong className="text-crema">
              {batches > 1 ? perBatchWaterMl : totalWaterMl}ml
            </strong>{" "}
            sobre el café.
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
          {batches > 1 && (
            <li>
              Repetí esto {batches} veces
              {measureMode === "tazas" ? ` hasta juntar las ${cups} tazas.` : "."}
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}