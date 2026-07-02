import type { CoffeeReview } from "@/lib/db";
import { ROAST_LABELS, PROCESS_LABELS } from "@/lib/constants";
import StarRating from "./StarRating";

export default function ReviewCard({
  review: r,
  showTaster = true,
}: {
  review: CoffeeReview;
  showTaster?: boolean;
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
              ROAST_LABELS[r.roast_level] ?? r.roast_level,
              r.brew_method,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
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
            <dt className="font-mono text-[10px] text-parchment-dim uppercase">{label}</dt>
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
  );
}
