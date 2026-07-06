"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import ReviewFormFields, {
  type ReviewFormState,
  type ReviewScores,
} from "./components/ReviewFormFields";
import ReviewIllustration from "./components/ReviewIllustration";
import type { Coffee } from "@/lib/db";

const initialScores: ReviewScores = {
  aroma: 0,
  acidity: 0,
  sweetness: 0,
  body: 0,
  bitterness: 0,
  aftertaste: 0,
  balance: 0,
};

const initialForm: ReviewFormState = {
  brew_method: "",
  price: "",
  notes: "",
  has_milk: false,
  milk_type: "",
  temperature: "",
  consumption_type: "",
  place_name: "",
};

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [form, setForm] = useState<ReviewFormState>(initialForm);
  const [scores, setScores] = useState<ReviewScores>(initialScores);
  const [overall, setOverall] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [lastSubmitted, setLastSubmitted] = useState<{
    coffee: Coffee;
    hasMilk: boolean;
    brewMethod: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit =
    coffee !== null &&
    form.brew_method &&
    Object.values(scores).every((v) => v > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setErrorMsg("Faltan campos por completar: elegí un café, el método y todas las escalas de sabor.");
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
            brew_method: form.brew_method,
            ...scores,
            overall_rating: overall,
            price: form.price ? Number(form.price) : null,
            notes: form.notes.trim() || null,
            has_milk: form.has_milk,
            milk_type: form.has_milk ? form.milk_type.trim() || null : null,
            temperature_preference: form.temperature || null,
            consumption_type: form.consumption_type || null,
            place_name:
              form.consumption_type === "lugar" ? form.place_name.trim() || null : null,
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

    setLastSubmitted({ coffee: coffee!, hasMilk: form.has_milk, brewMethod: form.brew_method });
    setStatus("sent");
    setCoffee(null);
    setForm(initialForm);
    setScores(initialScores);
    setOverall(1);
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
        </div>
      </main>
    );
  }

  if (status === "sent") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <div className="text-center md:text-left order-2 md:order-1">
            <CheckCircle2 size={32} className="text-crema mx-auto md:mx-0 mb-4" />
            <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-4">
              Ficha guardada
            </p>
            <h1 className="font-display text-3xl text-cream mb-4">
              Gracias, {session?.user?.name?.split(" ")[0]}. Tu catación quedó registrada.
            </h1>
            <button
              onClick={() => {
                setStatus("idle");
                setLastSubmitted(null);
              }}
              className="mt-4 px-6 py-3 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors"
            >
              Cargar otro café
            </button>
            <div className="mt-4">
              <Link href="/feed" className="text-parchment-dim text-sm underline underline-offset-4">
                Ver feed
              </Link>
            </div>
          </div>
          {lastSubmitted && (
            <div className="w-full max-w-[220px] md:max-w-[240px] shrink-0 order-1 md:order-2">
              <ReviewIllustration
                coffee={lastSubmitted.coffee}
                hasMilk={lastSubmitted.hasMilk}
                brewMethod={lastSubmitted.brewMethod}
              />
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-xl lg:max-w-4xl mx-auto lg:flex lg:items-start lg:gap-12">
        <div className="max-w-xl">
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
            <ReviewFormFields
              coffee={coffee}
              setCoffee={setCoffee}
              form={form}
              setForm={setForm}
              scores={scores}
              setScores={setScores}
              overall={overall}
              setOverall={setOverall}
            />

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
          </form>
        </div>

        <div className="hidden lg:block flex-1 self-stretch">
          <div className="sticky top-1/2 -translate-y-1/2">
            <ReviewIllustration coffee={coffee} hasMilk={form.has_milk} brewMethod={form.brew_method} />
          </div>
        </div>
      </div>
    </main>
  );
}
