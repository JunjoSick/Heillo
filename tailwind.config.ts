import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", '"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['var(--font-instrument-serif)', '"Instrument Serif"', "serif"],
        mono: ['var(--font-geist-mono)', '"Geist Mono"', "ui-monospace", "monospace"]
      },
      colors: {
        ink: "#16140F",
        moss: "#6E7457",
        "moss-soft": "#A8AB94",
        paper: "#FAF5EA",
        "paper-2": "#F2EBD8",
        mist: "#E8EFE9",
        leaf: "#4d7c59",
        clay: "#b95d46",
        gold: "#d6a84f"
      }
    }
  },
  plugins: []
};

export default config;
