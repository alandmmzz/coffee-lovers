"use client";

import { Coffee as CoffeeIcon } from "lucide-react";
import type { Coffee } from "@/lib/db";
import BrewMethodArt from "./BrewMethodArt";

const DARK_COFFEE = "#3A2314";
const MILK_COFFEE = "#C89B6C";

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
        className={`absolute left-[6%] top-[22%] w-[34%] aspect-[3/4] transition-all duration-500 ${
          coffee ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <path d="M8 18 L8 70 Q8 76 16 76 L44 76 Q52 76 52 70 L52 18 Z" fill="#5B4632" />
          <path d="M8 18 L14 6 L46 6 L52 18 Z" fill="#4A3928" />
          <rect x="24" y="2" width="12" height="8" rx="2" fill="#332318" />
          <rect x="14" y="30" width="32" height="32" rx="3" fill="#EDE3D0" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <div className="w-[46%] h-[40%] rounded-full overflow-hidden bg-cream/90 flex items-center justify-center shadow-sm">
            {coffee?.brand_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coffee.brand_logo_url}
                alt={coffee.brand}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <CoffeeIcon size={16} className="text-ink" />
            )}
          </div>
        </div>
        {coffee && (
          <p className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[9px] text-parchment-dim truncate px-1">
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
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[8%] w-[54%]">
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <path
            d="M20 28 L23 72 Q23 84 38 84 L62 84 Q77 84 77 72 L80 28 Z"
            fill="none"
            stroke="#EDE3D0"
            strokeWidth="3"
          />
          <path
            d="M25 32 L27.5 71 Q27.5 79 38 79 L62 79 Q72.5 79 72.5 71 L75 32 Z"
            fill={hasMilk ? MILK_COFFEE : DARK_COFFEE}
            style={{ transition: "fill 0.5s ease" }}
          />
          <path d="M80 38 Q98 38 98 53 Q98 68 80 66" fill="none" stroke="#EDE3D0" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}
