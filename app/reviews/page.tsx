import Link from "next/link";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROAST_LABELS: Record<string, string> = {
  light: "Claro",
  "medium-light": "Medio claro",
  medium: "Medio",
  "medium-dark": "Medio oscuro",
  dark: "Oscuro",
};

export default async function ReviewsPage() {
  let reviews: CoffeeReview[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select * from coffee_reviews order by created_at desc
    `) as unknown as CoffeeReview[];
  } catch (err: any) {
    error = err.message ?? "No se pudieron cargar las reviews.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
              Coffee Lovers · Archivo
            </p>
            <h1 className="font-display text-4xl text-cream leading-[1.05]">
              Cafés catados
            </h1>
          </div>
          <Link
            href="/"
            className="shrink-0 px-4 py-2.5 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors"
          >
            + Nueva review
          </Link>
        </header>

        {error && (
          <p className="text-cascara-light text-sm">
            No se pudieron cargar las reviews. {error}
          </p>
        )}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">
            Todavía no hay ninguna ficha cargada. Sé el primero en catar un café.
          </p>
        )}

        <ul className="space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-display text-xl text-cream">
                    {r.brand} — {r.coffee_type}
                  </h2>
                  <p className="font-mono text-xs text-parchment-dim mt-1">
                    {r.origin ? `${r.origin} · ` : ""}
                    {ROAST_LABELS[r.roast_level] ?? r.roast_level} · {r.brew_method}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-2xl text-crema leading-none">
                    {r.overall_rating}
                    <span className="text-xs text-parchment-dim">/10</span>
                  </p>
                  <p className="font-mono text-[11px] text-parchment-dim mt-1">
                    {r.taster_name}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
                {[
                  ["Aroma", r.aroma],
                  ["Acidez", r.acidity],
                  ["Dulzor", r.sweetness],
                  ["Cuerpo", r.body],
                  ["Amargor", r.bitterness],
                  ["Retrog.", r.aftertaste],
                  ["Balance", r.balance],
                ].map(([label, val]) => (
                  <div key={label as string} className="text-center">
                    <dt className="font-mono text-[10px] text-parchment-dim uppercase">
                      {label}
                    </dt>
                    <dd className="font-mono text-sm text-parchment">{val}/5</dd>
                  </div>
                ))}
              </dl>

              {r.notes && (
                <p className="font-body text-sm text-parchment-dim italic border-t border-parchment-dim/15 pt-3">
                  “{r.notes}”
                </p>
              )}

              <p className="font-mono text-[10px] text-parchment-dim/70 mt-3">
                {r.created_at ? new Date(r.created_at).toLocaleString("es-AR") : ""}
                {r.price ? ` · $${r.price}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
