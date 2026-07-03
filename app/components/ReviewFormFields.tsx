"use client";

import { Snowflake, Thermometer, Flame, Wind, Citrus, Candy, Layers, Leaf, Clock, Scale, MapPin, Home } from "lucide-react";
import ScoreScale from "./ScoreScale";
import StarRating from "./StarRating";
import CoffeeSelector from "./CoffeeSelector";
import type { Coffee } from "@/lib/db";

export const BREW_METHODS = [
  "Espresso",
  "V60 / Filtrado",
  "Prensa francesa",
  "Moka",
  "Aeropress",
  "Cold brew",
  "Cápsula",
  "Otro",
];

export type ReviewScores = {
  aroma: number;
  acidity: number;
  sweetness: number;
  body: number;
  bitterness: number;
  aftertaste: number;
  balance: number;
};

export type ReviewFormState = {
  brew_method: string;
  price: string;
  notes: string;
  has_milk: boolean;
  milk_type: string;
  temperature: string;
  consumption_type: string;
  place_name: string;
};

const TEMPERATURE_OPTIONS = [
  { value: "frio", label: "Frío", icon: Snowflake, color: "#5A8FB8" },
  { value: "tibio", label: "Tibio", icon: Thermometer, color: "#C98A3D" },
  { value: "caliente", label: "Caliente", icon: Flame, color: "#C1432E" },
];

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function ReviewFormFields({
  coffee,
  setCoffee,
  form,
  setForm,
  scores,
  setScores,
  overall,
  setOverall,
}: {
  coffee: Coffee | null;
  setCoffee: (c: Coffee) => void;
  form: ReviewFormState;
  setForm: (f: ReviewFormState) => void;
  scores: ReviewScores;
  setScores: (s: ReviewScores) => void;
  overall: number;
  setOverall: (n: number) => void;
}) {
  return (
    <>
      {/* 01 — Identificación */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">01</span>
          <h2 className="font-display text-xl text-cream">Identificación</h2>
        </div>
        <div>
          <label className="field-label">Café</label>
          <CoffeeSelector value={coffee} onChange={setCoffee} />
          <p className="font-mono text-[11px] text-parchment-dim mt-2">
            Buscá un café ya cargado o agregá uno nuevo con su marca, línea, origen y proceso.
          </p>
        </div>
      </section>

      {/* 02 — Método y leche */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">02</span>
          <h2 className="font-display text-xl text-cream">Método</h2>
        </div>
        <div className="space-y-5">
          <Field label="Método de preparación">
            <select
              required
              value={form.brew_method}
              onChange={(e) => setForm({ ...form, brew_method: e.target.value })}
              className="input-field"
            >
              <option value="" disabled>
                Elegí un método
              </option>
              {BREW_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.has_milk}
                onChange={(e) =>
                  setForm({
                    ...form,
                    has_milk: e.target.checked,
                    milk_type: e.target.checked ? form.milk_type : "",
                  })
                }
                className="w-4 h-4 accent-cascara"
              />
              <span className="font-body text-sm text-parchment">Le agregué leche</span>
            </label>

            {form.has_milk && (
              <div className="mt-3">
                <label className="field-label">Tipo de leche (opcional)</label>
                <input
                  list="milk-suggestions"
                  value={form.milk_type}
                  onChange={(e) => setForm({ ...form, milk_type: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Entera, descremada, avena..."
                />
                <datalist id="milk-suggestions">
                  <option value="Entera" />
                  <option value="Descremada" />
                  <option value="Deslactosada" />
                  <option value="Avena" />
                  <option value="Almendra" />
                  <option value="Soja" />
                </datalist>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 03 — Temperatura */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">03</span>
          <h2 className="font-display text-xl text-cream">Temperatura</h2>
        </div>
        <p className="font-mono text-[11px] text-parchment-dim mb-3">
          ¿Cómo te gustó más tomarlo? (opcional)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TEMPERATURE_OPTIONS.map(({ value, label, icon: Icon, color }) => {
            const selected = form.temperature === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setForm({ ...form, temperature: selected ? "" : value })
                }
                aria-pressed={selected}
                className="flex flex-col items-center gap-1.5 py-3 rounded-sm border transition-colors"
                style={
                  selected
                    ? { borderColor: color, backgroundColor: `${color}1A`, color }
                    : undefined
                }
              >
                <Icon
                  size={18}
                  className={selected ? "" : "text-parchment-dim"}
                  style={selected ? { color } : undefined}
                />
                <span
                  className={`font-mono text-xs ${selected ? "" : "text-parchment-dim"}`}
                  style={selected ? { color } : undefined}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 04 — Lugar */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">04</span>
          <h2 className="font-display text-xl text-cream">Lugar</h2>
        </div>
        <p className="font-mono text-[11px] text-parchment-dim mb-3">(opcional)</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setForm({ ...form, consumption_type: "lugar" })}
            aria-pressed={form.consumption_type === "lugar"}
            className={`flex items-center justify-center gap-2 py-3 rounded-sm border transition-colors ${
              form.consumption_type === "lugar"
                ? "border-crema bg-crema/10 text-crema"
                : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
            }`}
          >
            <MapPin size={16} />
            <span className="font-mono text-xs">Lo tomé ahí</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, consumption_type: "casa", place_name: "" })
            }
            aria-pressed={form.consumption_type === "casa"}
            className={`flex items-center justify-center gap-2 py-3 rounded-sm border transition-colors ${
              form.consumption_type === "casa"
                ? "border-crema bg-crema/10 text-crema"
                : "border-parchment-dim/20 text-parchment-dim hover:border-parchment-dim/40"
            }`}
          >
            <Home size={16} />
            <span className="font-mono text-xs">Lo preparé en casa</span>
          </button>
        </div>

        {form.consumption_type === "lugar" && (
          <Field label="Nombre del lugar">
            <input
              value={form.place_name}
              onChange={(e) => setForm({ ...form, place_name: e.target.value })}
              className="input-field"
              placeholder="Ej: Doré Palermo, La esquina de casa..."
            />
          </Field>
        )}
      </section>

      {/* 05 — Atributos sensoriales */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-crema text-sm">05</span>
          <h2 className="font-display text-xl text-cream">Atributos sensoriales</h2>
        </div>
        <p className="font-mono text-[11px] text-parchment-dim mb-2">1 = bajo/débil · 5 = alto/intenso</p>
        <div>
          <ScoreScale
            label="Aroma"
            description="El olor del café antes de probarlo, en seco y recién molido."
            value={scores.aroma}
            onChange={(v) => setScores({ ...scores, aroma: v })}
            icon={Wind}
            color="#8B7BA8"
          />
          <ScoreScale
            label="Acidez"
            description="La viveza que sentís en la lengua, parecida a un cítrico o una manzana verde. No es 'agrio': es una sensación refrescante y chispeante."
            value={scores.acidity}
            onChange={(v) => setScores({ ...scores, acidity: v })}
            icon={Citrus}
            color="#B8A542"
          />
          <ScoreScale
            label="Dulzor"
            description="El dulzor natural del grano, sin agregar azúcar. Puede recordar a caramelo, miel o fruta madura."
            value={scores.sweetness}
            onChange={(v) => setScores({ ...scores, sweetness: v })}
            icon={Candy}
            color="#C77B92"
          />
          <ScoreScale
            label="Cuerpo"
            description="Qué tan denso se siente en la boca: liviano como agua o pesado como leche entera."
            value={scores.body}
            onChange={(v) => setScores({ ...scores, body: v })}
            icon={Layers}
            color="#B8663F"
          />
          <ScoreScale
            label="Amargor"
            description="La sensación amarga natural del café. En su justa medida le da carácter; en exceso, resulta desagradable."
            value={scores.bitterness}
            onChange={(v) => setScores({ ...scores, bitterness: v })}
            icon={Leaf}
            color="#7C8B5E"
          />
          <ScoreScale
            label="Retrogusto"
            description="El sabor que se queda en la boca después de tragar el trago, y cuánto dura."
            value={scores.aftertaste}
            onChange={(v) => setScores({ ...scores, aftertaste: v })}
            icon={Clock}
            color="#5A8A8C"
          />
          <ScoreScale
            label="Balance general"
            description="Qué tan bien conviven todos los sabores entre sí, sin que ninguno se imponga de más sobre el resto."
            value={scores.balance}
            onChange={(v) => setScores({ ...scores, balance: v })}
            icon={Scale}
            color="#D4A857"
          />
        </div>
      </section>

      {/* 06 — Puntaje general */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">06</span>
          <h2 className="font-display text-xl text-cream">Puntaje general</h2>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={overall}
            onChange={(e) => setOverall(Number(e.target.value))}
            className="flex-1 accent-cascara"
          />
          <span className="font-mono text-2xl text-crema w-12 text-right">{overall}</span>
        </div>
        <div className="mt-3">
          <StarRating rating={overall} size={22} />
        </div>
        <p className="font-mono text-[11px] text-parchment-dim mt-2">de 1 a 10</p>
      </section>

      {/* 07 — Notas */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">07</span>
          <h2 className="font-display text-xl text-cream">Notas</h2>
        </div>
        <Field label="Precio pagado (opcional)">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input-field"
            placeholder="0.00"
          />
        </Field>
        <div className="mt-4">
          <Field label="Comentarios libres (opcional)">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field min-h-24 resize-y"
              placeholder="Notas de cata, con qué lo tomarías, para cuándo lo comprarías de nuevo..."
            />
          </Field>
        </div>
      </section>
    </>
  );
}
