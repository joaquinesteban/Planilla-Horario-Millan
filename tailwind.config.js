/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg0: "#0c0c0f",
        bg1: "#111116",
        bg2: "#18181f",
        bg3: "#1f1f28",
        bg4: "#262632",
        // Borders
        border1: "#2e2e3e",
        border2: "#3a3a50",
        // Text
        tx1: "#f0f0f8",
        tx2: "#a0a0b8",
        tx3: "#606078",
        // Accent
        acc: "#7c6af7",
        acc2: "#9d8fff",
        // Sectores / estados
        grn: "#34d399",
        amb: "#fbbf24",
        red: "#f87171",
        blu: "#60a5fa",
        pink: "#f472b6",
        cyn: "#22d3ee",
        org: "#fb923c",
        lim: "#a3e635",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
