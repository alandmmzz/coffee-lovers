const STROKE = "#EDE3D0";
const CREMA = "#D4A857";
const CASCARA = "#A23B2E";
const TERRACOTTA = "#B8663F";

function Espresso() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <ellipse cx="30" cy="45" rx="17" ry="2.5" fill="none" stroke={STROKE} strokeWidth="1.75" opacity="0.6" />
      <path
        d="M18 22 L20.5 41 Q21 45 30 45 Q39 45 39.5 41 L42 22 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.75"
      />
      <path d="M42 26 Q50 26 50 31.5 Q50 37 42 35.5" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <ellipse cx="30" cy="22" rx="12" ry="2.75" fill={CREMA} />
    </svg>
  );
}

function V60() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* jarra */}
      <path
        d="M20 36 L20 46 Q20 50 30 50 Q40 50 40 46 L40 36 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.75"
      />
      {/* cono */}
      <path d="M17 20 L43 20 L30 38 Z" fill="none" stroke={STROKE} strokeWidth="1.75" />
      {/* filtro/café adentro */}
      <path d="M22 23 L38 23 L30 34 Z" fill={TERRACOTTA} opacity="0.7" />
      {/* gotas */}
      <circle cx="30" cy="41" r="1.4" fill={CREMA} />
    </svg>
  );
}

function FrenchPress() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* cuerpo */}
      <rect x="19" y="22" width="22" height="26" rx="2" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <rect x="21" y="30" width="18" height="16" fill={TERRACOTTA} opacity="0.55" />
      {/* mango */}
      <path d="M41 27 Q49 27 49 34 Q49 41 41 40" fill="none" stroke={STROKE} strokeWidth="1.75" />
      {/* tapa y embolo */}
      <rect x="18" y="19" width="24" height="3.5" rx="1.5" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <line x1="30" y1="10" x2="30" y2="19" stroke={STROKE} strokeWidth="1.75" />
      <circle cx="30" cy="9" r="2.5" fill="none" stroke={STROKE} strokeWidth="1.75" />
    </svg>
  );
}

function Moka() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* base */}
      <path d="M22 44 L20 34 L26 30 L34 30 L40 34 L38 44 Z" fill="none" stroke={STROKE} strokeWidth="1.75" />
      {/* cintura */}
      <path d="M25 30 L21 26 L39 26 L35 30 Z" fill="none" stroke={STROKE} strokeWidth="1.75" />
      {/* superior */}
      <path d="M23 26 L21 16 L27 13 L33 13 L39 16 L37 26 Z" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <rect x="26" y="30" width="8" height="10" fill={CASCARA} opacity="0.5" />
      {/* pico */}
      <path d="M39 18 L45 15 L44 19 L39 21 Z" fill="none" stroke={STROKE} strokeWidth="1.5" />
      {/* mango */}
      <path d="M21 32 Q13 32 13 38 Q13 43 21 42" fill="none" stroke={STROKE} strokeWidth="1.75" />
    </svg>
  );
}

function Aeropress() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* camara */}
      <path d="M23 18 L23 42 L37 42 L37 18 Z" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <rect x="25" y="27" width="10" height="13" fill={TERRACOTTA} opacity="0.55" />
      {/* base/tapa filtro */}
      <ellipse cx="30" cy="42" rx="8" ry="2" fill="none" stroke={STROKE} strokeWidth="1.75" />
      {/* embolo */}
      <line x1="30" y1="8" x2="30" y2="18" stroke={STROKE} strokeWidth="1.75" />
      <rect x="24" y="6" width="12" height="3.5" rx="1" fill="none" stroke={STROKE} strokeWidth="1.75" />
    </svg>
  );
}

function ColdBrew() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {/* frasco */}
      <path
        d="M21 20 L21 42 Q21 48 30 48 Q39 48 39 42 L39 20 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.75"
      />
      <path d="M18 18 L42 18 L40 21 L20 21 Z" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <rect x="24" y="30" width="12" height="14" fill={TERRACOTTA} opacity="0.5" />
      {/* hielo */}
      <rect x="25" y="25" width="5" height="5" rx="1" fill={STROKE} opacity="0.5" transform="rotate(10 27 27)" />
      <rect x="31" y="31" width="4.5" height="4.5" rx="1" fill={STROKE} opacity="0.4" transform="rotate(-8 33 33)" />
      {/* pajita */}
      <line x1="34" y1="10" x2="27" y2="26" stroke={CREMA} strokeWidth="2" />
    </svg>
  );
}

function Capsula() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <path
        d="M30 12 Q42 12 42 26 L42 36 Q42 46 30 46 Q18 46 18 36 L18 26 Q18 12 30 12 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.75"
      />
      <path
        d="M30 17 Q38 17 38 26 L38 35 Q38 41 30 41 Q22 41 22 35 L22 26 Q22 17 30 17 Z"
        fill={CASCARA}
        opacity="0.55"
      />
      <ellipse cx="30" cy="15" rx="6" ry="2" fill="none" stroke={STROKE} strokeWidth="1.5" />
    </svg>
  );
}

function Otro() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="24" cy="28" r="7" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <circle cx="36" cy="28" r="7" fill="none" stroke={STROKE} strokeWidth="1.75" />
      <circle cx="30" cy="38" r="7" fill={TERRACOTTA} opacity="0.6" stroke={STROKE} strokeWidth="1.75" />
    </svg>
  );
}

export const BREW_METHOD_ART: Record<string, () => JSX.Element> = {
  Espresso: Espresso,
  "V60 / Filtrado": V60,
  "Prensa francesa": FrenchPress,
  Moka: Moka,
  Aeropress: Aeropress,
  "Cold brew": ColdBrew,
  Cápsula: Capsula,
  Otro: Otro,
};

export default function BrewMethodArt({ method }: { method: string }) {
  const Art = BREW_METHOD_ART[method] ?? Otro;
  return <Art />;
}
