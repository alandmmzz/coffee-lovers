"use client";

import RoastSelector from "./RoastSelector";
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
  roast_level: string;
  brew_method: string;
  price: string;
  notes: string;
  has_milk: boolean;
  milk_type: string;
};

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

      {/* 02 — Tueste, método y leche */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">02</span>
          <h2 className="font-display text-xl text-cream">Tueste y método</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="field-label">Nivel de tueste</label>
            <RoastSelector
              value={form.roast_level}
              onChange={(v) => setForm({ ...form, roast_level: v })}
            />
          </div>
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

      {/* 03 — Atributos sensoriales */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-crema text-sm">03</span>
          <h2 className="font-display text-xl text-cream">Atributos sensoriales</h2>
        </div>
        <p className="font-mono text-[11px] text-parchment-dim mb-2">1 = bajo/débil · 5 = alto/intenso</p>
        <div>
          <ScoreScale
            label="Aroma"
            description="El olor del café antes de probarlo, en seco y recién molido."
            value={scores.aroma}
            onChange={(v) => setScores({ ...scores, aroma: v })}
          />
          <ScoreScale
            label="Acidez"
            description="La viveza que sentís en la lengua, parecida a un cítrico o una manzana verde. No es 'agrio': es una sensación refrescante y chispeante."
            value={scores.acidity}
            onChange={(v) => setScores({ ...scores, acidity: v })}
          />
          <ScoreScale
            label="Dulzor"
            description="El dulzor natural del grano, sin agregar azúcar. Puede recordar a caramelo, miel o fruta madura."
            value={scores.sweetness}
            onChange={(v) => setScores({ ...scores, sweetness: v })}
          />
          <ScoreScale
            label="Cuerpo"
            description="Qué tan denso se siente en la boca: liviano como agua o pesado como leche entera."
            value={scores.body}
            onChange={(v) => setScores({ ...scores, body: v })}
          />
          <ScoreScale
            label="Amargor"
            description="La sensación amarga natural del café. En su justa medida le da carácter; en exceso, resulta desagradable."
            value={scores.bitterness}
            onChange={(v) => setScores({ ...scores, bitterness: v })}
          />
          <ScoreScale
            label="Retrogusto"
            description="El sabor que se queda en la boca después de tragar el trago, y cuánto dura."
            value={scores.aftertaste}
            onChange={(v) => setScores({ ...scores, aftertaste: v })}
          />
          <ScoreScale
            label="Balance general"
            description="Qué tan bien conviven todos los sabores entre sí, sin que ninguno se imponga de más sobre el resto."
            value={scores.balance}
            onChange={(v) => setScores({ ...scores, balance: v })}
          />
        </div>
      </section>

      {/* 04 — Puntaje general */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">04</span>
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
          <span className="font-mono text-2xl text-crema w-12 text-right">{overall || "–"}</span>
        </div>
        {overall > 0 && (
          <div className="mt-3">
            <StarRating rating={overall} size={22} />
          </div>
        )}
        <p className="font-mono text-[11px] text-parchment-dim mt-2">de 1 a 10</p>
      </section>

      {/* 05 — Notas */}
      <section className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-mono text-crema text-sm">05</span>
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
