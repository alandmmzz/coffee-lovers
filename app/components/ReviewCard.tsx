"use client";

import { useState } from "react";
import Link from "next/link";
import { Milk, Pencil, Snowflake, Thermometer, Flame, Wind, Citrus, Candy, Layers, Leaf, Clock, Scale, MapPin, Home } from "lucide-react";
import type { CoffeeReview, Coffee, ReviewComment } from "@/lib/db";
import { ROAST_LABELS, PROCESS_LABELS, TEMPERATURE_LABELS } from "@/lib/constants";
import StarRating from "./StarRating";
import ReviewIllustration from "./ReviewIllustration";
import ReviewReactions from "./ReviewReactions";
import ReviewComments from "./ReviewComments";

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
  { label: "Retrog.", key: "aftertaste" as const, icon: Clock, color: "#5A8A8C" },
  { label: "Balance", key: "balance" as const, icon: Scale, color: "#D4A857" },
];

export default function ReviewCard({
  review: r,
  showTaster = true,
  editable = false,
}: {
  review: CoffeeReview;
  showTaster?: boolean;
  editable?: boolean;
}) {
  const coffeeForIllustration: Coffee | null = r.brand
    ? {
        id: r.coffee_id,
        brand: r.brand,
        line: r.line ?? "",
        origin: r.origin ?? null,
        farm: r.farm ?? null,
        variety: r.variety ?? null,
        process: r.process ?? null,
        tasting_notes: r.tasting_notes ?? null,
        brand_logo_url: r.brand_logo_url ?? null,
      }
    : null;

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ReviewComment[]>(r.comments ?? []);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {showTaster && r.user_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.user_image}
            alt={r.taster_name}
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
        )}
        {showTaster && (
          <span className="font-mono text-xs text-parchment">{r.taster_name}</span>
        )}
        <span className="font-mono text-[11px] text-parchment-dim/70">
          {r.created_at ? new Date(r.created_at).toLocaleString("es-AR") : ""}
        </span>
      </div>

      <ReviewReactions
        reviewId={r.id ?? ""}
        reviewUserEmail={r.user_email}
        initialReactions={r.reactions ?? []}
        initialMyReaction={r.myReaction ?? null}
        commentCount={comments.length}
        onToggleComments={() => setCommentsOpen((o) => !o)}
      >
        <div className="flex flex-col-reverse sm:flex-row gap-5">
          {/* Info — izquierda */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl text-cream">
                {r.brand} — {r.line}
              </h2>
              <div className="text-right shrink-0">
                <StarRating rating={r.overall_rating} size={16} />
                {editable && r.id && (
                  <Link
                    href={`/reviews/${r.id}/edit`}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-parchment-dim hover:text-crema transition-colors mt-1.5"
                  >
                    <Pencil size={11} />
                    Editar
                  </Link>
                )}
              </div>
            </div>

            <p className="font-mono text-xs text-parchment-dim mt-1">
              {[
                r.origin,
                r.process ? PROCESS_LABELS[r.process] ?? r.process : null,
                r.roast_level ? ROAST_LABELS[r.roast_level] ?? r.roast_level : null,
                r.brew_method,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {r.has_milk && (
              <p className="flex items-center gap-1 font-mono text-[11px] text-parchment-dim mt-1.5">
                <Milk size={11} />
                Con leche{r.milk_type ? ` (${r.milk_type})` : ""}
              </p>
            )}

            {(r.temperature_preference || r.consumption_type) && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                {r.temperature_preference &&
                  (() => {
                    const t = TEMPERATURE_STYLES[r.temperature_preference];
                    if (!t) return null;
                    const Icon = t.icon;
                    return (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[11px]"
                        style={{ borderColor: `${t.color}55`, color: t.color }}
                      >
                        <Icon size={11} />
                        {TEMPERATURE_LABELS[r.temperature_preference] ?? r.temperature_preference}
                      </span>
                    );
                  })()}

                {r.consumption_type === "casa" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-parchment-dim/25 font-mono text-[11px] text-parchment-dim">
                    <Home size={11} />
                    En casa
                  </span>
                )}

                {r.consumption_type === "lugar" && r.place_name && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.place_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-parchment-dim/25 font-mono text-[11px] text-parchment-dim hover:border-crema hover:text-crema transition-colors"
                  >
                    <MapPin size={11} />
                    {r.place_name}
                  </a>
                )}
              </div>
            )}

            <dl className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3 mt-3">
              {ATTRIBUTES.map(({ label, key, icon: Icon, color }) => (
                <div key={key} className="flex flex-col items-center gap-1 text-center">
                  <Icon size={14} style={{ color }} />
                  <dt className="font-mono text-[9px] text-parchment-dim uppercase">{label}</dt>
                  <dd className="font-mono text-sm" style={{ color }}>
                    {r[key]}/5
                  </dd>
                </div>
              ))}
            </dl>

            {r.notes && (
              <p className="font-body text-sm text-muted italic border-t border-parchment-dim/15 pt-3">
                “{r.notes}”
              </p>
            )}

            {r.price ? (
              <p className="font-mono text-[10px] text-parchment-dim/70 mt-3">${r.price}</p>
            ) : null}
          </div>

          {/* Ilustración — derecha, oculta en mobile por ahora */}
          <div className="hidden sm:block w-full max-w-[150px] mx-auto sm:mx-0 sm:w-32 shrink-0 opacity-75">
            <ReviewIllustration
              coffee={coffeeForIllustration}
              hasMilk={r.has_milk}
              brewMethod={r.brew_method}
            />
          </div>
        </div>

        <ReviewComments
          reviewId={r.id ?? ""}
          initialComments={r.comments ?? []}
          open={commentsOpen}
          onCommentsChange={setComments}
        />
      </ReviewReactions>
    </div>
  );
}
