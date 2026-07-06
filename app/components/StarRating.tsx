import { Star } from "lucide-react";

function HalfStar({ size }: { size: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Star size={size} className="absolute inset-0 text-parchment-dim/40" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
        <Star size={size} className="fill-crema text-crema" />
      </div>
    </div>
  );
}

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
        {hasHalf && <HalfStar size={size} />}
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
