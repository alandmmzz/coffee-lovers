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
    <div className="max-w-[440px] mx-auto">
      <div className="bg-parchment rounded-lg border-2 border-crema/40 shadow-2xl p-6">
        <div className="flex items-end justify-center">
          {/* Bolsa de café */}
          <div
            className={`relative z-0 w-[34%] -mr-4 transition-opacity duration-500 ${
              showBag ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/pouch.png" alt="" className="w-full h-full object-contain" />
              {coffee?.brand_logo_url && (
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[30%] aspect-square rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center">
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

          {/* Taza: vacía / negra / con leche, adelante */}
          <div className="relative z-10 w-[46%] aspect-square drop-shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/empty-cup.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
              style={{ opacity: cupState === "empty" ? 1 : 0 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/coffee-cup.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
              style={{ opacity: cupState === "black" ? 1 : 0 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/milk-cup.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
              style={{ opacity: cupState === "milk" ? 1 : 0 }}
            />
          </div>

          {/* Método de preparación */}
          <div
            className={`relative z-0 w-[34%] -ml-4 aspect-square transition-opacity duration-500 ${
              showMethod ? "opacity-100" : "opacity-0"
            }`}
          >
            {showMethod && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={METHOD_IMAGES[brewMethod]}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
