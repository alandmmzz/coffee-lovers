import { Star, StarHalf } from "lucide-react";

export default function StarRating({
  rating,
  size = 20,
  showNumber = true,
}: {
  rating: number;
  size?: number;
  showNumber?: boolean;
}) {
  const stars5 = rating / 2;
  const full = Math.floor(stars5);
  const hasHalf = stars5 - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating} de 10 puntos`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-crema text-crema" />
        ))}
        {hasHalf && <StarHalf size={size} className="fill-crema text-crema" />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-parchment-dim/40" />
        ))}
      </div>
      {showNumber && (
        <span className="font-mono text-xs text-parchment-dim">{rating}/10</span>
      )}
    </div>
  );
}
