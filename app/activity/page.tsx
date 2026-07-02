import Link from "next/link";
import { ChevronRight, Coffee } from "lucide-react";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import StarRating from "../components/StarRating";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  let reviews: CoffeeReview[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select * from coffee_reviews order by created_at desc limit 100
    `) as unknown as CoffeeReview[];
  } catch (err: any) {
    error = err.message ?? "No se pudo cargar la actividad.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers · Actividad
          </p>
          <h1 className="font-display text-4xl text-cream leading-[1.05]">
            Últimas cataciones
          </h1>
          <p className="font-body text-parchment-dim text-sm mt-3 max-w-md">
            Un registro en orden cronológico de todo lo que se fue catando.
            Tocá cualquier fila para ver el detalle completo.
          </p>
        </header>

        {error && (
          <p className="text-cascara-light text-sm">No se pudo cargar la actividad. {error}</p>
        )}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">Todavía no hay actividad registrada.</p>
        )}

        <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
          {reviews.map((r) => (
            <li key={r.id}>
              <Link
                href={`/activity/${r.id}`}
                className="flex items-center gap-4 py-4 px-2 -mx-2 rounded-sm hover:bg-parchment/[0.04] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                  {r.user_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.user_image}
                      alt={r.taster_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Coffee size={16} className="text-cream" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-cream truncate">
                    <span className="text-parchment-dim">{r.taster_name}</span> cató{" "}
                    <span className="font-medium">
                      {r.brand} — {r.coffee_type}
                    </span>
                  </p>
                  <p className="font-mono text-[11px] text-parchment-dim mt-1">
                    {r.created_at ? formatRelativeTime(r.created_at) : ""}
                  </p>
                </div>

                <StarRating rating={r.overall_rating} size={14} showNumber={false} />

                <ChevronRight
                  size={18}
                  className="text-parchment-dim/50 group-hover:text-crema transition-colors shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
