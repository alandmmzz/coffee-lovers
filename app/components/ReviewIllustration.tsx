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
<<<<<<< HEAD
  "V60 / Filtrado": { width: "66%", top: "15%", left: "54%" },
  "Prensa francesa": { width: "90%", top: "-7%", left: "44%" },
  Moka: { width: "122%", top: "-25%", left: "19%" },
  "Cold brew": { width: "69%", top: "7%", left: "53%" },
  Aeropress: { width: "75%", top: "7%", left: "54%" },
  Cápsula: { width: "85%", top: "11%", left: "55%", transform: "rotateX(25deg)" },
  Espresso: { width: "130%", top: "-30%", left: "35%" },
};

const BAG_PLACEMENT: Placement = { width: "119%", top: "-35%", left: "-34%" };
const CUP_WIDTH = "85%";
const CUP_TOP = "55%";
=======
  "V60 / Filtrado": { width: "66%", top: "0%", left: "54%" },
  "Prensa francesa": { width: "90%", top: "-22%", left: "44%" },
  Moka: { width: "122%", top: "-40%", left: "19%" },
  "Cold brew": { width: "69%", top: "-8%", left: "53%" },
  Aeropress: { width: "75%", top: "-8%", left: "54%" },
  Cápsula: { width: "85%", top: "-4%", left: "55%", transform: "rotateX(25deg)" },
  Espresso: { width: "130%", top: "-45%", left: "35%" },
};

const BAG_PLACEMENT: Placement = { width: "119%", top: "-50%", left: "-34%" };
const CUP_WIDTH = "85%";
const CUP_TOP = "40%";
>>>>>>> 6709964aebd8288ac296d15d595d1d7341b00c58

const OBJECT_SHADOW = "drop-shadow(0 8px 6px rgba(0,0,0,0.4))";

function FloorGlow() {
  return (
    <div
      className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[62%] h-[16%] rounded-[50%] pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 72%)",
      }}
    />
  );
}

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
        <div className="relative w-full h-full" style={{ perspective: "55px" }}>
          <FloorGlow />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pouch.png"
            alt=""
            className="relative w-full h-full object-contain"
            style={{ filter: OBJECT_SHADOW }}
          />
          {coffee?.brand_logo_url && (
            <div
              className="absolute aspect-square rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center"
              style={{
                width: "20%",
                top: "52%",
                left: "48%",
                transform: "rotateY(12deg)",
                transformStyle: "preserve-3d",
              }}
            >
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
          <div className="relative w-full h-full">
            <FloorGlow />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={METHOD_IMAGES[brewMethod]}
              alt=""
              className="relative w-full h-full object-contain"
              style={{ filter: OBJECT_SHADOW }}
            />
          </div>
        </div>
      )}

      {/* Taza — al frente, centro */}
      <div
        className="absolute left-1/2 -translate-x-1/2 aspect-square z-10"
        style={{ width: CUP_WIDTH, top: CUP_TOP }}
      >
        <FloorGlow />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/empty-cup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ opacity: cupState === "empty" ? 1 : 0, filter: OBJECT_SHADOW }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/coffee-cup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ opacity: cupState === "black" ? 1 : 0, filter: OBJECT_SHADOW }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/milk-cup.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ opacity: cupState === "milk" ? 1 : 0, filter: OBJECT_SHADOW }}
        />
      </div>
    </div>
  );
}
