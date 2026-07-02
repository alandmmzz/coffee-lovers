"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import RoastSelector from "./components/RoastSelector";
import ScoreScale from "./components/ScoreScale";
import StarRating from "./components/StarRating";
import CoffeeSelector from "./components/CoffeeSelector";
import type { Coffee } from "@/lib/db";

const BREW_METHODS = [
  "Espresso",
  "V60 / Filtrado",
  "Prensa francesa",
  "Moka",
  "Aeropress",
  "Cold brew",
  "Cápsula",
  "Otro",
];

const initialScores = {
  aroma: 0,
  acidity: 0,
  sweetness: 0,
  body: 0,
  bitterness: 0,
  aftertaste: 0,
  balance: 0,
};

const initialForm = {
  roast_level: "",
  brew_method: "",
  price: "",
  notes: "",
  has_milk: false,
  milk_type: "",
};

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [form, setForm] = useState(initialForm);
  const [scores, setScores] = useState(initialScores);
  const [overall, setOverall] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit =
    coffee !== null &&
    form.roast_level &&
    form.brew_method &&
    Object.values(scores).every((v) => v > 0) &&
    overall > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setErrorMsg("Faltan campos por completar: elegí un café, el tueste, el método y todas las escalas de sabor.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    const { error } = await (async () => {
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coffee_id: coffee!.id,
            roast_level: form.roast_level,
            brew_method: form.brew_method,
            ...scores,
            overall_rating: overall,
            price: form.price ? Number(form.price) : null,
            notes: form.notes.trim() || null,
            has_milk: form.has_milk,
            milk_type: form.has_milk ? form.milk_type.trim() || null : null,
          }),
        });
        const data = await res.json();
        if (!data.ok) return { error: { message: data.error ?? "Error desconocido" } };
        return { error: null };
      } catch (err: any) {
        return { error: { message: err.message ?? "No se pudo conectar con el servidor" } };
      }
    })();

    if (error) {
      setStatus("error");
      setErrorMsg("No se pudo guardar la review. " + error.message);
      return;
    }

    setStatus("sent");
    setCoffee(null);
    setForm(initialForm);
    setScores(initialScores);
    setOverall(0);
  }

  if (sessionStatus === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-mono text-xs text-parchment-dim uppercase tracking-widest">
          Cargando...
        </p>
      </main>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-4">
            Coffee Lovers
          </p>
          <h1 className="font-display text-3xl text-cream mb-3">
            Iniciá sesión para dejar tu review
          </h1>
          <p className="font-body text-parchment-dim text-sm mb-8">
            Así cada catación queda guardada en tu perfil.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => signIn("github")}
              className="w-full py-3 bg-parchment/[0.06] border border-parchment-dim/25 hover:border-crema text-cream font-body text-sm rounded-sm transition-colors"
            >
              Continuar con GitHub
            </button>
            <button
              onClick={() => signIn("google")}
              className="w-full py-3 bg-parchment/[0.06] border border-parchment-dim/25 hover:border-crema text-cream font-body text-sm rounded-sm transition-colors"
            >
              Continuar con Google
            </button>
          </div>
          <div className="mt-6">
            <Link href="/reviews" className="text-parchment-dim text-sm underline underline-offset-4">
              Ver reviews de la comunidad sin loguearte
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (status === "sent") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <CheckCircle2 size={32} className="text-crema mx-auto mb-4" />
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-4">
            Ficha guardada
          </p>
          <h1 className="font-display text-3xl text-cream mb-4">
            Gracias, {session?.user?.name?.split(" ")[0]}. Tu catación quedó registrada.
          </h1>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 px-6 py-3 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors"
          >
            Cargar otro café
          </button>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link href="/activity" className="text-parchment-dim text-sm underline underline-offset-4">
              Ver actividad
            </Link>
            <Link href="/reviews" className="text-parchment-dim text-sm underline underline-offset-4">
              Ver todas las reviews
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers · Ficha de catación
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-cream leading-[1.05] mb-3">
            Registrá lo que probaste
          </h1>
          <p className="font-body text-parchment-dim text-sm max-w-md">
            Completá cada sección en orden, tal como se cata un café: primero
            identificás el grano, después el tueste y por último el sabor.
          </p>
          <p className="font-mono text-[11px] text-parchment-dim/80 mt-3">
            Catando como {session?.user?.name} ({session?.user?.email})
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* 02 — Tueste y método */}
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
              <span className="font-mono text-2xl text-crema w-12 text-right">
                {overall || "–"}
              </span>
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

          {status === "error" && (
            <p className="text-cascara-light text-sm font-body" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-4 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream font-body text-sm tracking-wide rounded-sm transition-colors"
          >
            {status === "sending" ? "Guardando..." : "Guardar review"}
          </button>

          <p className="text-center">
            <Link href="/reviews" className="text-parchment-dim text-sm underline underline-offset-4">
              Ver todas las reviews
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
