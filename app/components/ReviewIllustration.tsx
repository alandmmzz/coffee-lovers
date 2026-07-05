"use client";

import { Coffee as CoffeeIcon } from "lucide-react";
import type { Coffee } from "@/lib/db";
import BrewMethodArt from "./BrewMethodArt";

export default function ReviewIllustration({
  coffee,
  hasMilk,
  brewMethod,
}: {
  coffee: Coffee | null;
  hasMilk: boolean;
  brewMethod: string;
}) {
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto select-none">
      {/* Bolsa de café, atrás - izquierda */}
      <div
        className={`absolute left-[4%] top-[16%] w-[38%] aspect-square transition-all duration-500 ${
          coffee ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/coffee-bag.png"
          alt=""
          className="w-full h-full object-contain drop-shadow-lg"
        />
        <div className="absolute inset-0 flex items-start justify-center pt-[30%]">
          <div className="w-[32%] aspect-square rounded-full overflow-hidden bg-cream/95 flex items-center justify-center shadow-md">
            {coffee?.brand_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coffee.brand_logo_url}
                alt={coffee.brand}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <CoffeeIcon size={14} className="text-ink" />
            )}
          </div>
        </div>
        {coffee && (
          <p className="absolute -bottom-5 left-0 right-0 text-center font-mono text-[9px] text-parchment-dim truncate px-1">
            {coffee.brand}
          </p>
        )}
      </div>

      {/* Medallón del método, atrás - derecha */}
      <div
        className={`absolute right-[4%] top-[18%] w-[34%] aspect-square rounded-full bg-ink-soft border border-parchment-dim/25 shadow-lg transition-all duration-500 ${
          brewMethod ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <div className="w-full h-full p-2.5">
          {brewMethod && <BrewMethodArt method={brewMethod} />}
        </div>
      </div>

      {/* Vapor */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[6%] w-16 h-16 pointer-events-none">
        <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
          <path
            d="M22 50 Q18 40 24 32 Q30 24 24 14"
            fill="none"
            stroke="#DDD0B6"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
            className="steam-line"
            style={{ animationDelay: "0s" }}
          />
          <path
            d="M34 50 Q30 40 36 32 Q42 24 36 14"
            fill="none"
            stroke="#DDD0B6"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.4"
            className="steam-line"
            style={{ animationDelay: "1s" }}
          />
        </svg>
      </div>

      {/* Taza, al frente centro */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[4%] w-[62%] aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/coffee-cup-black.png"
          alt=""
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ opacity: hasMilk ? 0 : 1 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/coffee-cup-milk.png"
          alt=""
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ opacity: hasMilk ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
