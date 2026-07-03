"use client";

import { useState } from "react";
import {
  Coffee,
  Droplets,
  Thermometer,
  Clock,
  Minus,
  Plus,
  Info,
  CheckCircle2,
  HelpCircle,
  User,
  Users,
  Feather,
  Flame,
} from "lucide-react";

const INTENSITY_LEVELS = [
  { label: "Suave", ratio: 17, minutes: 3 },
  { label: "Medio-suave", ratio: 16, minutes: 3.5 },
  { label: "Medio", ratio: 15, minutes: 4 },
  { label: "Medio-fuerte", ratio: 14, minutes: 4.5 },
  { label: "Fuerte", ratio: 12, minutes: 5 },
];

// Tamaños comerciales más comunes. Si la tuya no está, se puede agregar
// una medida propia más abajo.
const PRESS_SIZES = [350, 600, 800, 1000, 1500];

const CUP_SIZE_ML = 200;
const WATER_TEMP_C = 94;

function pressIcon(ml: number) {
  return ml <= 400 ? User : Users;
}

function pressIconSize(ml: number) {
  const min = 350;
  const max = 1500;
  const clamped = Math.min(Math.max(ml, min), max);
  return Math.round(16 + ((clamped - min) / (max - min)) * 12);
}

type Inventory = Record<number, number>; // ml -> cantidad que tenés

export default function FrenchPressCalculator() {
  const [intensity, setIntensity] = useState(2); // índice 0-4, arranca en "Medio"
  const [cups, setCups] = useState(4);
  const [alreadyGround, setAlreadyGround] = useState<boolean | null>(null);
  const [inventory, setInventory] = useState<Inventory>({ 1000: 1 });
  const [customSize, setCustomSize] = useState("");
  const [showTempInfo, setShowTempInfo] = useState(false);

  const level = INTENSITY_LEVELS[intensity];
  const totalWaterMl = cups * CUP_SIZE_ML;
  const minutes = Math.floor(level.minutes);
  const seconds = level.minutes % 1 === 0.5 ? 30 : 0;

  function setCount(ml: number, count: number) {
    setInventory((prev) => {
      const next = { ...prev };
      if (count <= 0) delete next[ml];
      else next[ml] = count;
      return next;
    });
  }

  function addCustomSize() {
    const ml = Number(customSize);
    if (!ml || ml <= 0) return;
    setInventory((prev) => ({ ...prev, [ml]: (prev[ml] ?? 0) + 1 }));
    setCustomSize("");
  }

  // Unidades individuales de prensa, de mayor a menor capacidad
  const units: number[] = [];
  Object.entries(inventory)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .forEach(([ml, count]) => {
      for (let i = 0; i < count; i++) units.push(Number(ml));
    });

  // Repartir el agua total en rondas, usando varias prensas a la vez
  // dentro de cada ronda si hace falta.
  type PressUsage = { size: number; waterMl: number; coffeeG: number };
  const rounds: PressUsage[][] = [];
  let remaining = totalWaterMl;
  let safety = 0;
  while (remaining > 0 && units.length > 0 && safety < 20) {
    safety++;
    let left = remaining;
    const round: PressUsage[] = [];
    for (const size of units) {
      if (left <= 0) break;
      const used = Math.min(size, left);
      round.push({ size, waterMl: used, coffeeG: Math.round(used / level.ratio) });
      left -= used;
    }
    const roundTotal = round.reduce((s, r) => s + r.waterMl, 0);
    if (roundTotal === 0) break;
    rounds.push(round);
    remaining -= roundTotal;
  }

  const hasPresses = units.length > 0;
  const customEntries = Object.keys(inventory)
    .map(Number)
    .filter((ml) => !PRESS_SIZES.includes(ml))
    .sort((a, b) => a - b);

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

      {/* Intensidad, con íconos que crecen hacia el extremo elegido */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">Intensidad</label>
          <span className="font-mono text-sm text-crema">{level.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <Feather
            className="text-parchment-dim shrink-0 transition-all"
            style={{ width: 14 + (4 - intensity) * 3, height: 14 + (4 - intensity) * 3 }}
          />
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="flex-1 accent-cascara"
          />
          <Flame
            className="text-cascara shrink-0 transition-all"
            style={{ width: 14 + intensity * 3, height: 14 + intensity * 3 }}
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-parchment-dim mt-1">
          <span>Suave</span>
          <span>Fuerte</span>
        </div>
      </div>

      {/* Tazas */}
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
        <p className="font-mono text-[10px] text-parchment-dim mt-3 text-center">
          Asumiendo tazas de {CUP_SIZE_ML} ml cada una
        </p>
      </div>

      {/* Selector lateral de prensas: una fila por tamaño, con su cantidad */}
      <div>
        <label className="field-label mb-2">Tus prensas francesas</label>
        <div className="space-y-2">
          {PRESS_SIZES.map((ml) => {
            const Icon = pressIcon(ml);
            const iconSize = pressIconSize(ml);
            const count = inventory[ml] ?? 0;
            return (
              <div
                key={ml}
                className={`flex items-center justify-between gap-3 p-3 rounded-sm border transition-colors ${
                  count > 0
                    ? "border-crema/40 bg-crema/5"
                    : "border-parchment-dim/15 bg-parchment/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={iconSize}
                    className={count > 0 ? "text-crema" : "text-parchment-dim"}
                  />
                  <span className="font-mono text-sm text-parchment">{ml} ml</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCount(ml, count - 1)}
                    disabled={count === 0}
                    aria-label={`Restar una prensa de ${ml}ml`}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors disabled:opacity-30"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-sm text-cream w-4 text-center">{count}</span>
                  <button
                    type="button"
                    onClick={() => setCount(ml, count + 1)}
                    aria-label={`Sumar una prensa de ${ml}ml`}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {customEntries.map((ml) => {
            const Icon = pressIcon(ml);
            const iconSize = pressIconSize(ml);
            const count = inventory[ml];
            return (
              <div
                key={ml}
                className="flex items-center justify-between gap-3 p-3 rounded-sm border border-crema/40 bg-crema/5"
              >
                <div className="flex items-center gap-3">
                  <Icon size={iconSize} className="text-crema" />
                  <span className="font-mono text-sm text-parchment">{ml} ml</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCount(ml, count - 1)}
                    aria-label={`Restar una prensa de ${ml}ml`}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-sm text-cream w-4 text-center">{count}</span>
                  <button
                    type="button"
                    onClick={() => setCount(ml, count + 1)}
                    aria-label={`Sumar una prensa de ${ml}ml`}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-parchment-dim/25 text-parchment hover:border-crema transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="number"
            min={1}
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            className="input-field flex-1"
            placeholder="Otra medida en ml"
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="px-4 py-2 border border-parchment-dim/25 hover:border-crema text-parchment font-mono text-xs rounded-sm transition-colors shrink-0"
          >
            Agregar
          </button>
        </div>
      </div>

      {!hasPresses && (
        <p className="font-body text-sm text-parchment-dim">
          Agregá al menos una prensa arriba para calcular las cantidades.
        </p>
      )}

      {hasPresses && (
        <>
          {/* Desglose por prensa (y por tanda, si hace falta más de una) */}
          <div className="space-y-4">
            {rounds.map((round, ri) => (
              <div key={ri}>
                {rounds.length > 1 && (
                  <p className="font-mono text-[11px] text-crema uppercase tracking-wide mb-2">
                    Tanda {ri + 1} de {rounds.length}
                  </p>
                )}
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${round.length}, minmax(0, 1fr))` }}
                >
                  {round.map((p, pi) => {
                    const Icon = pressIcon(p.size);
                    return (
                      <div
                        key={pi}
                        className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon size={14} className="text-crema" />
                          <span className="font-mono text-[10px] text-parchment-dim uppercase">
                            {p.size}ml
                          </span>
                        </div>
                        <p className="font-mono text-xl text-cream leading-none">{p.coffeeG}g</p>
                        <p className="font-mono text-[10px] text-parchment-dim mt-1">café</p>
                        <p className="font-mono text-xl text-cream leading-none mt-2">
                          {p.waterMl}ml
                        </p>
                        <p className="font-mono text-[10px] text-parchment-dim mt-1">agua</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Temperatura y tiempo, comunes a todas las prensas */}
          <div className="grid grid-cols-2 gap-3">
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
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              <p className="font-body text-xs text-parchment-dim leading-relaxed">
                <strong className="text-crema">Más caliente</strong> (agua recién hervida,
                ~100°C): extrae más rápido y saca sabores amargos y ásperos de más.{" "}
                <strong className="text-crema">Más fría</strong> (por debajo de 90°C): extrae de
                menos, el café queda plano, más ácido y con poco cuerpo. Por eso {WATER_TEMP_C}°C
                (agua hervida que reposó unos 30 segundos) es el punto justo para prensa
                francesa.
              </p>
            </div>
          )}

          {/* Pasos */}
          <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5">
            <h3 className="font-display text-lg text-cream mb-3">Cómo prepararlo</h3>
            <ol className="space-y-2 font-body text-sm text-parchment list-decimal list-inside">
              {alreadyGround ? (
                <li>Pesá el café ya molido según la cantidad indicada para cada prensa arriba.</li>
              ) : (
                <li>
                  Molé el café en molienda gruesa (como sal gruesa o azúcar mascabo), la cantidad
                  indicada para cada prensa arriba.
                </li>
              )}
              <li>Poné el café correspondiente en cada prensa vacía.</li>
              <li>Calentá el agua a punto de hervor y dejala reposar unos 30 segundos.</li>
              <li>Volcá el agua correspondiente en cada prensa.</li>
              <li>Revolvé suave una vez en cada una, para que todo el café se moje parejo.</li>
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
              {rounds.length > 1 && <li>Repetí esto en las {rounds.length} tandas.</li>}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
