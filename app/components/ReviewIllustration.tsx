"use client";

import type { Coffee } from "@/lib/db";

const METHOD_IMAGES: Record<string, string> = {
  Espresso: "/images/espresso.png",
  "V60 / Filtrado": "/images/v60.png",
  "Prensa francesa": "/images/french-press.png",
  Moka: "/images/moka.png",
  Aeropress: "/images/aeropress.png",
  "Cold brew": "/images/cold-brew.png",
  Cápsula: "/images/capsules.png",
};

export default function ReviewIllustration({
  coffee,
  hasMilk,
  brewMethod,
}: {
  coffee: Coffee | null;
  hasMilk: boolean;
  brewMethod: string;
}) {
  const showBag = !!coffee;
  const showMethod = !!brewMethod && !!METHOD_IMAGES[brewMethod];
  const cupState: "empty" | "black" | "milk" = !showMethod ? "empty" : hasMilk ? "milk" : "black";

  return (
    <div className="relative w-full max-w-[480px] mx-auto" style={{ aspectRatio: "4 / 5" }}>
      {/* Bolsa de café — atrás, arriba a la izquierda */}
      <div
        className={`absolute left-0 top-[6%] w-[38%] transition-opacity duration-500 ${
          showBag ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/pouch.png" alt="" className="w-full h-full object-contain drop-shadow-xl" />
          {coffee?.brand_logo_url && (
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[28%] aspect-square rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coffee.brand_logo_url}
                alt={coffee.brand}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Método de preparación — atrás, arriba a la derecha */}
      <div
        className={`absolute right-0 top-[6%] w-[38%] aspect-square transition-opacity duration-500 ${
          showMethod ? "opacity-100" : "opacity-0"
        }`}
      >
        {showMethod && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={METHOD_IMAGES[brewMethod]}
            alt=""
            className="w-full h-full object-contain drop-shadow-xl"
          />
        )}
      </div>

      {/* Taza — al frente, centro-abajo, más grande que el resto */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[74%] aspect-square z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/empty-cup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-opacity duration-500"
          style={{ opacity: cupState === "empty" ? 1 : 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/coffee-cup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-opacity duration-500"
          style={{ opacity: cupState === "black" ? 1 : 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/milk-cup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-opacity duration-500"
          style={{ opacity: cupState === "milk" ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
