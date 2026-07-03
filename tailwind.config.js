/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241812",
        "ink-soft": "#332318",
        parchment: "#EDE3D0",
        "parchment-dim": "#DDD0B6",
        cascara: "#A23B2E",
        "cascara-light": "#C15A44",
        crema: "#D4A857",
        greenbean: "#7C8B5E",
        cream: "#F2E9DC",
        muted: "#9C9384",
        violet: "#8B7BA8",
        citrus: "#B8A542",
        rose: "#C77B92",
        terracotta: "#B8663F",
        teal: "#5A8A8C",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
