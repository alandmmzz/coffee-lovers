import Link from "next/link";
import { Milk, Pencil, Snowflake, Thermometer, Flame, Wind, Citrus, Candy, Layers, Leaf, Clock, Scale, MapPin, Home } from "lucide-react";
import type { CoffeeReview } from "@/lib/db";
import { ROAST_LABELS, PROCESS_LABELS, TEMPERATURE_LABELS } from "@/lib/constants";
import StarRating from "./StarRating";

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
  return (
    <li className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="font-display text-xl text-cream">
            {r.brand} — {r.line}
          </h2>
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
            <p className="flex items-center gap-1 font-mono text-[11px] text-parchment-dim mt-1">
              <Milk size={11} />
              Con leche{r.milk_type ? ` (${r.milk_type})` : ""}
            </p>
          )}
          {r.temperature_preference && (
            <p className="flex items-center gap-1 font-mono text-[11px] mt-1">
              {(() => {
                const t = TEMPERATURE_STYLES[r.temperature_preference];
                if (!t) return null;
                const Icon = t.icon;
                return (
                  <>
                    <Icon size={11} style={{ color: t.color }} />
                    <span style={{ color: t.color }}>
                      {TEMPERATURE_LABELS[r.temperature_preference] ?? r.temperature_preference}
                    </span>
                  </>
                );
              })()}
            </p>
          )}
          {r.consumption_type === "casa" && (
            <p className="flex items-center gap-1 font-mono text-[11px] text-parchment-dim mt-1">
              <Home size={11} />
              En casa
            </p>
          )}
          {r.consumption_type === "lugar" && r.place_name && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.place_name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-[11px] text-parchment-dim hover:text-crema transition-colors mt-1"
            >
              <MapPin size={11} />
              {r.place_name}
            </a>
          )}
        </div>
        <div className="text-right shrink-0">
          <StarRating rating={r.overall_rating} size={16} />
          {showTaster && (
            <div className="flex items-center gap-1.5 justify-end mt-1.5">
              {r.user_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.user_image}
                  alt={r.taster_name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : null}
              <p className="font-mono text-[11px] text-parchment-dim truncate max-w-[120px]">
                {r.taster_name}
              </p>
            </div>
          )}
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

      <dl className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
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

      <p className="font-mono text-[10px] text-parchment-dim/70 mt-3">
        {r.created_at ? new Date(r.created_at).toLocaleString("es-AR") : ""}
        {r.price ? ` · $${r.price}` : ""}
      </p>
    </li>
  );
}
