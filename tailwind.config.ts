import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#17211b",
        moss: "#375444",
        leaf: "#4d7c59",
        clay: "#b95d46",
        gold: "#d6a84f",
        paper: "#f7f4ee",
        mist: "#e8efe9"
      }
    }
  },
  plugins: []
};

export default config;
