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
  // Modo "prensa": cuántas veces se llena CADA tamaño (podés combinar
  // una prensa de 350ml con una de 600ml en la misma preparación).
  const [pressCounts, setPressCounts] = useState<Record<number, number>>({ 1000: 1 });
  const [customPressMl, setCustomPressMl] = useState("");
  const [customPressCount, setCustomPressCount] = useState(0);
  const [alreadyGround, setAlreadyGround] = useState<boolean | null>(null);
  // Modo "tazas": una sola prensa de referencia, para calcular tandas.
  const [pressSize, setPressSize] = useState<number>(1000);
  const [customSize, setCustomSize] = useState("");
  const [showTempInfo, setShowTempInfo] = useState(false);

  const level = INTENSITY_LEVELS[intensity];
  const effectivePressSize = customSize ? Number(customSize) || 0 : pressSize;

  // Lista de prensas activas en modo "prensa": cada tamaño preseteado con
  // cantidad > 0, más la medida personalizada si tiene cantidad > 0.
  const activePresses = [
    ...PRESS_SIZES.map((p) => ({ ml: p.ml, label: p.label, count: pressCounts[p.ml] || 0 })),
    ...(Number(customPressMl) > 0 && customPressCount > 0
      ? [{ ml: Number(customPressMl), label: `${customPressMl}ml`, count: customPressCount }]
      : []),
  ].filter((p) => p.count > 0);

  const totalPresses = activePresses.reduce((sum, p) => sum + p.count, 0);

  // "Por prensa": sumamos el agua de cada prensa que se va a llenar.
  // "Por tazas": el usuario dice cuántas tazas quiere, y de ahí derivamos
  // cuántas tandas de prensa hacen falta (con UNA prensa de referencia).
  const totalWaterMl =
    measureMode === "prensa"
      ? activePresses.reduce((sum, p) => sum + p.ml * p.count, 0)
      : cups * cupSize;
  const totalCoffeeG = Math.round(totalWaterMl / level.ratio);
  const minutes = Math.floor(level.minutes);
  const seconds = level.minutes % 1 === 0.5 ? 30 : 0;

  const batches =
    measureMode === "prensa"
      ? Math.max(1, totalPresses)
      : effectivePressSize > 0
      ? Math.max(1, Math.ceil(totalWaterMl / effectivePressSize))
      : 1;
  const perBatchWaterMl = Math.round(totalWaterMl / batches);
  const perBatchCoffeeG = Math.round(perBatchWaterMl / level.ratio);
  // Solo tiene sentido dividir "por tanda" en modo tazas con una prensa
  // homogénea. En modo prensa mostramos el total, porque el desglose por
  // tamaño ya se ve en la lista de arriba.
  const showPerBatch = measureMode === "tazas" && batches > 1;

  return (
    <div className="space-y-8">
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
        /* Por prensa — elegís cuántas veces se llena CADA tamaño. Podés
           combinar, por ej., 1 prensa de 350ml + 1 de 600ml. */
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <label className="field-label mb-3">¿Cuántas prensas de cada tamaño?</label>
          <div className="space-y-2.5">
            {PRESS_SIZES.map((p) => (
              <div key={p.ml} className="flex items-center justify-between">
                <span className="font-mono text-xs text-parchment">{p.label}</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setPressCounts((c) => ({
                        ...c,
                        [p.ml]: Math.max(0, (c[p.ml] || 0) - 1),
                      }))
                    }
                    aria-label={`Restar prensa de ${p.label}`}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-lg text-cream w-5 text-center">
                    {pressCounts[p.ml] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPressCounts((c) => ({
                        ...c,
                        [p.ml]: Math.min(5, (c[p.ml] || 0) + 1),
                      }))
                    }
                    aria-label={`Sumar prensa de ${p.label}`}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-parchment-dim/10">
            <input
              type="number"
              min={1}
              value={customPressMl}
              onChange={(e) => setCustomPressMl(e.target.value)}
              className="input-field flex-1"
              placeholder="Otra medida en ml (ej: 450)"
            />
            <button
              type="button"
              onClick={() => setCustomPressCount((n) => Math.max(0, n - 1))}
              aria-label="Restar prensa de medida personalizada"
              className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors shrink-0"
            >
              <Minus size={13} />
            </button>
            <span className="font-mono text-lg text-cream w-5 text-center shrink-0">
              {customPressCount}
            </span>
            <button
              type="button"
              onClick={() => setCustomPressCount((n) => Math.min(5, n + 1))}
              aria-label="Sumar prensa de medida personalizada"
              className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors shrink-0"
            >
              <Plus size={13} />
            </button>
          </div>

          {activePresses.length === 0 && (
            <p className="font-mono text-[10px] text-parchment-dim mt-3 text-center">
              Elegí al menos una prensa arriba
            </p>
          )}
        </div>
      ) : (
        /* Por tazas — tazas de mesa (200-250ml), no las de cafetera eléctrica */
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <label className="field-label mb-3">Cantidad de tazas</label>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setCups((c) => Math.max(1, c - 1))}
              aria-label="Restar una taza"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono text-3xl text-cream w-8 text-center">{cups}</span>
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

      {/* Tamaño de la prensa — solo aplica en modo "tazas", para saber
          cuántas tandas hacen falta con la prensa que tenés */}
      {measureMode === "tazas" && (
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
      )}

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

      {measureMode === "prensa" && activePresses.length > 0 && (
        <div className="flex items-start gap-3 bg-crema/10 border border-crema/30 rounded-sm p-4">
          <Layers size={18} className="text-crema shrink-0 mt-0.5" />
          <div className="w-full">
            <p className="font-body text-sm text-crema mb-1.5">
              Vas a preparar <strong>{totalPresses} tanda{totalPresses === 1 ? "" : "s"}</strong>:
            </p>
            <ul className="space-y-0.5">
              {activePresses.map((p) => (
                <li key={p.ml} className="font-mono text-[11px] text-parchment-dim">
                  {p.count}× prensa de {p.label} → {Math.round(p.ml / level.ratio)}g de café c/u
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Resultado */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Coffee size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">
            {showPerBatch ? perBatchCoffeeG : totalCoffeeG}g
          </p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Café molido{showPerBatch ? " (por tanda)" : ""}
          </p>
        </div>
        <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <Droplets size={16} className="text-crema mb-2" />
          <p className="font-mono text-2xl text-cream leading-none">
            {showPerBatch ? perBatchWaterMl : totalWaterMl}ml
          </p>
          <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
            Agua{showPerBatch ? " (por tanda)" : ""}
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
              Usá <strong className="text-crema">{showPerBatch ? perBatchCoffeeG : totalCoffeeG}g</strong>{" "}
              de tu café ya molido.
            </li>
          ) : (
            <li>
              Molé <strong className="text-crema">{showPerBatch ? perBatchCoffeeG : totalCoffeeG}g</strong>{" "}
              de café en molienda gruesa (como sal gruesa o azúcar mascabo).
            </li>
          )}
          <li>Ponelo en la prensa francesa vacía.</li>
          <li>
            Calentá el agua a punto de hervor, dejala reposar unos 30 segundos, y volcá{" "}
            <strong className="text-crema">
              {showPerBatch ? perBatchWaterMl : totalWaterMl}ml
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
          {measureMode === "tazas" && batches > 1 && (
            <li>Repetí esto {batches} veces hasta juntar las {cups} tazas.</li>
          )}
          {measureMode === "prensa" && totalPresses > 1 && (
            <li>
              Repetí el proceso para cada prensa (mirá el desglose de arriba para saber
              cuánto café va en cada una).
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
