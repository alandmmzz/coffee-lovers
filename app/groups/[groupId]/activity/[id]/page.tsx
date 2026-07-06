import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Coffee, MapPin, Flame, Droplets, Sprout, Milk, Snowflake, Thermometer, Wallet, Wind, Citrus, Candy, Layers, Leaf, Clock, Scale, Home } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import { ROAST_LABELS, PROCESS_LABELS, TEMPERATURE_LABELS } from "@/lib/constants";
import StarRating from "../../../../components/StarRating";

export const dynamic = "force-dynamic";

const TEMPERATURE_STYLES: Record<string, { icon: typeof Snowflake; color: string }> = {
  frio: { icon: Snowflake, color: "#5A8FB8" },
  tibio: { icon: Thermometer, color: "#C98A3D" },
  caliente: { icon: Flame, color: "#C1432E" },
};

const ATTRIBUTES = [
  { label: "Aroma", key: "aroma" as const, icon: Wind, color: "#8B7BA8" },
  { label: "Acidez", key: "acidity" as const, icon: Citrus, color: "#B8A542" },
  { label: "Dulzor", key: "sweetness" as const, icon: Candy, color: "#C77B92" },
  { label: "Cuerpo", key: "body" as const, icon: Layers, color: "#B8663F" },
  { label: "Amargor", key: "bitterness" as const, icon: Leaf, color: "#7C8B5E" },
  { label: "Retrogusto", key: "aftertaste" as const, icon: Clock, color: "#5A8A8C" },
  { label: "Balance", key: "balance" as const, icon: Scale, color: "#D4A857" },
];

export default async function GroupActivityDetailPage({
  params,
}: {
  params: { groupId: string; id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const membership = await sql`
    select 1 from group_members where group_id = ${params.groupId} and user_email = ${session.user.email}
  `;
  if (membership.length === 0) {
    redirect("/feed");
  }

  let review: CoffeeReview | null = null;
  try {
    const rows = (await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.id = ${params.id}
      limit 1
    `) as unknown as CoffeeReview[];
    review = rows[0] ?? null;

    // La review es visible en este grupo solo si su autor es miembro
    if (review?.user_email) {
      const authorMembership = await sql`
        select 1 from group_members where group_id = ${params.groupId} and user_email = ${review.user_email}
      `;
      if (authorMembership.length === 0) {
        review = null;
      }
    }
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
          href={`/groups/${params.groupId}/activity`}
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

        {(r.origin || r.variety) && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-parchment-dim mb-5">
            <MapPin size={13} />
            {[r.origin, r.variety].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mb-8">
          <StarRating rating={r.overall_rating} size={28} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {r.roast_level && (
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
                <Flame size={12} />
                Tueste
              </p>
              <p className="font-body text-sm text-cream">
                {ROAST_LABELS[r.roast_level] ?? r.roast_level}
              </p>
            </div>
          )}
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
          {r.has_milk && (
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
                <Milk size={12} />
                Leche
              </p>
              <p className="font-body text-sm text-cream">{r.milk_type || "Sí"}</p>
            </div>
          )}
          {r.temperature_preference && TEMPERATURE_STYLES[r.temperature_preference] && (
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
                {(() => {
                  const Icon = TEMPERATURE_STYLES[r.temperature_preference].icon;
                  return <Icon size={12} style={{ color: TEMPERATURE_STYLES[r.temperature_preference].color }} />;
                })()}
                Temperatura
              </p>
              <p
                className="font-body text-sm"
                style={{ color: TEMPERATURE_STYLES[r.temperature_preference].color }}
              >
                {TEMPERATURE_LABELS[r.temperature_preference] ?? r.temperature_preference}
              </p>
            </div>
          )}
          {r.consumption_type === "casa" && (
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
                <Home size={12} />
                Dónde
              </p>
              <p className="font-body text-sm text-cream">En casa</p>
            </div>
          )}
          {r.consumption_type === "lugar" && r.place_name && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.place_name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4 hover:border-crema transition-colors"
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-dim uppercase mb-1.5">
                <MapPin size={12} />
                Dónde
              </p>
              <p className="font-body text-sm text-cream truncate">{r.place_name}</p>
            </a>
          )}
        </div>

        <section className="mb-8">
          <h2 className="font-display text-lg text-cream mb-4">Atributos sensoriales</h2>
          <div className="space-y-2">
            {ATTRIBUTES.map(({ label, key, icon: Icon, color }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-body text-sm text-parchment">
                  <Icon size={14} style={{ color }} />
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: i < r[key] ? color : "rgba(221, 208, 182, 0.15)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs w-6 text-right" style={{ color }}>
                    {r[key]}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {(r.farm || r.tasting_notes) && (
          <section className="mb-8">
            <h2 className="font-display text-lg text-cream mb-3">Ficha del café</h2>
            <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4 space-y-3">
              {r.farm && (
                <div>
                  <p className="font-mono text-[10px] text-parchment-dim uppercase mb-1">Finca</p>
                  <p className="font-body text-sm text-cream">{r.farm}</p>
                </div>
              )}
              {r.tasting_notes && (
                <div>
                  <p className="font-mono text-[10px] text-parchment-dim uppercase mb-1">
                    Notas del tostador
                  </p>
                  <p className="font-body text-sm text-parchment">{r.tasting_notes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {r.notes && (
          <section className="mb-8">
            <h2 className="font-display text-lg text-cream mb-3">Notas de cata</h2>
            <p className="font-body text-sm text-muted italic bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
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
