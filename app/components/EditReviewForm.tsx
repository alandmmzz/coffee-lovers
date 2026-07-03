"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Trash2 } from "lucide-react";
import ReviewFormFields, {
  type ReviewFormState,
  type ReviewScores,
} from "./ReviewFormFields";
import type { Coffee, CoffeeReview } from "@/lib/db";

export default function EditReviewForm({ review }: { review: CoffeeReview }) {
  const router = useRouter();

  const [coffee, setCoffee] = useState<Coffee | null>({
    id: review.coffee_id,
    brand: review.brand ?? "",
    line: review.line ?? "",
    origin: review.origin ?? null,
    farm: review.farm ?? null,
    variety: review.variety ?? null,
    process: review.process ?? null,
    tasting_notes: review.tasting_notes ?? null,
  });

  const [form, setForm] = useState<ReviewFormState>({
    brew_method: review.brew_method,
    price: review.price != null ? String(review.price) : "",
    notes: review.notes ?? "",
    has_milk: review.has_milk,
    milk_type: review.milk_type ?? "",
    temperature: review.temperature_preference ?? "",
    consumption_type: review.consumption_type ?? "",
    place_name: review.place_name ?? "",
  });

  const [scores, setScores] = useState<ReviewScores>({
    aroma: review.aroma,
    acidity: review.acidity,
    sweetness: review.sweetness,
    body: review.body,
    bitterness: review.bitterness,
    aftertaste: review.aftertaste,
    balance: review.balance,
  });

  const [overall, setOverall] = useState(review.overall_rating);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canSubmit =
    coffee !== null &&
    form.brew_method &&
    Object.values(scores).every((v) => v > 0) &&
    overall > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setErrorMsg("Faltan campos por completar: elegí un café, el método y todas las escalas de sabor.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
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
      if (!data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "No se pudo guardar el cambio.");
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "No se pudo conectar con el servidor.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar esta review de ${review.brand} — ${review.line}? No se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "No se pudo eliminar la review.");
        setDeleting(false);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "No se pudo conectar con el servidor.");
      setDeleting(false);
    }
  }

  return (
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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex-1 py-4 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream font-body text-sm tracking-wide rounded-sm transition-colors"
        >
          {status === "sending" ? "Guardando..." : "Guardar cambios"}
        </button>
        <Link
          href="/profile"
          className="flex items-center gap-1.5 px-5 py-4 border border-parchment-dim/25 hover:border-crema text-parchment font-body text-sm rounded-sm transition-colors"
        >
          <X size={16} />
          Cancelar
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="w-full flex items-center justify-center gap-1.5 py-3 border border-cascara/30 hover:border-cascara text-cascara-light disabled:opacity-60 font-body text-sm rounded-sm transition-colors"
      >
        <Trash2 size={15} />
        {deleting ? "Eliminando..." : "Eliminar review"}
      </button>
    </form>
  );
}
