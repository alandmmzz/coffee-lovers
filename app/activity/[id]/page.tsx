import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coffee, MapPin, Flame, Droplets, Sprout, Wallet } from "lucide-react";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import { ROAST_LABELS, PROCESS_LABELS } from "@/lib/constants";
import StarRating from "../../components/StarRating";

export const dynamic = "force-dynamic";

const ATTRIBUTES: [string, keyof CoffeeReview][] = [
  ["Aroma", "aroma"],
  ["Acidez", "acidity"],
  ["Dulzor", "sweetness"],
  ["Cuerpo", "body"],
  ["Amargor", "bitterness"],
  ["Retrogusto", "aftertaste"],
  ["Balance", "balance"],
];

export default async function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let review: CoffeeReview | null = null;

  try {
    const rows = (await sql`
      select r.*, c.brand, c.line, c.origin, c.process
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.id = ${params.id}
      limit 1
    `) as unknown as CoffeeReview[];
    review = rows[0] ?? null;
  } catch {
    review = null;
  }

  if (!review) {
    notFound();
  }

  const r = review;

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <Link
          href="/activity"
          className="inline-flex items-center gap-1.5 text-parchment-dim text-sm hover:text-crema transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver a actividad
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
            {r.user_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.user_image} alt={r.taster_name} className="w-full h-full object-cover" />
            ) : (
              <Coffee size={18} className="text-cream" />
            )}
          </div>
          <div>
            <p className="font-body text-sm text-cream">{r.taster_name}</p>
            <p className="font-mono text-[11px] text-parchment-dim">
              {r.created_at ? new Date(r.created_at).toLocaleString("es-AR") : ""}
            </p>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-2">
          {r.brand} — {r.line}
        </h1>

        {r.origin && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-parchment-dim mb-5">
            <MapPin size={13} />
            {r.origin}
          </p>
        )}

        <div className="mb-8">
          <StarRating rating={r.overall_rating} size={28} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
            <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
              <Flame size={12} />
              Tueste
            </p>
            <p className="font-body text-sm text-cream">
              {ROAST_LABELS[r.roast_level] ?? r.roast_level}
            </p>
          </div>
          {r.process && (
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
                <Sprout size={12} />
                Proceso
              </p>
              <p className="font-body text-sm text-cream">
                {PROCESS_LABELS[r.process] ?? r.process}
              </p>
            </div>
          )}
          <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
            <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
              <Droplets size={12} />
              Método
            </p>
            <p className="font-body text-sm text-cream">{r.brew_method}</p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="font-display text-lg text-cream mb-4">Atributos sensoriales</h2>
          <div className="space-y-2">
            {ATTRIBUTES.map(([label, key]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-body text-sm text-parchment">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (r[key] as number) ? "bg-crema" : "bg-parchment-dim/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-parchment-dim w-6 text-right">
                    {r[key] as number}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {r.notes && (
          <section className="mb-8">
            <h2 className="font-display text-lg text-cream mb-3">Notas de cata</h2>
            <p className="font-body text-sm text-parchment-dim italic bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              “{r.notes}”
            </p>
          </section>
        )}

        {r.price != null && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-parchment-dim">
            <Wallet size={13} />
            Precio pagado: ${r.price}
          </p>
        )}
      </div>
    </main>
  );
}
