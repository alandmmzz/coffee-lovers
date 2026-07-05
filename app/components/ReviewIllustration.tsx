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

type Placement = {
  width: string;
  top: string;
  left: string;
  transform?: string;
};

const METHOD_PLACEMENT: Record<string, Placement> = {
  "V60 / Filtrado": { width: "66%", top: "0%", left: "54%" },
  "Prensa francesa": { width: "90%", top: "-22%", left: "44%" },
  Moka: { width: "95%", top: "-22%", left: "44%" },
  "Cold brew": { width: "69%", top: "-8%", left: "53%" },
  Aeropress: { width: "75%", top: "-8%", left: "54%" },
  Cápsula: { width: "85%", top: "-4%", left: "55%", transform: "rotateX(25deg)" },
  Espresso: { width: "130%", top: "-45%", left: "35%" },
};

const BAG_PLACEMENT: Placement = { width: "100%", top: "-35%", left: "-30%" };
const CUP_WIDTH = "85%";

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
  const methodPlacement = METHOD_PLACEMENT[brewMethod];
  const showMethod = !!brewMethod && !!METHOD_IMAGES[brewMethod] && !!methodPlacement;
  const cupState: "empty" | "black" | "milk" = !showMethod ? "empty" : hasMilk ? "milk" : "black";

  return (
    <div className="relative w-full max-w-[480px] mx-auto" style={{ aspectRatio: "4 / 5" }}>
      {/* Bolsa de café */}
      <div
        className={`absolute aspect-square transition-opacity duration-500 ${
          showBag ? "opacity-100" : "opacity-0"
        }`}
        style={{ width: BAG_PLACEMENT.width, top: BAG_PLACEMENT.top, left: BAG_PLACEMENT.left }}
      >
        <div className="relative w-full h-full">
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

      {/* Método de preparación */}
      {showMethod && (
        <div
          className="absolute aspect-square transition-opacity duration-500 opacity-100"
          style={{
            width: methodPlacement.width,
            top: methodPlacement.top,
            left: methodPlacement.left,
            transform: methodPlacement.transform,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={METHOD_IMAGES[brewMethod]}
            alt=""
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
      )}

      {/* Taza — al frente, centro-abajo */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 aspect-square z-10"
        style={{ width: CUP_WIDTH }}
      >
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
