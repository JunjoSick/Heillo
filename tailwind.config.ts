import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', '"Geist"', "serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"]
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
        gold: "#d6a84f",
        // per-rule hues
        sub: "#5B5EE0",
        "sub-bg": "#E9EAFF",
        ins: "#2C9E5C",
        "ins-bg": "#DDF3E2",
        del: "#D24A3D",
        "del-bg": "#FBE2DC",
        swp: "#C2399E",
        "swp-bg": "#F8DDEE",
        len: "#D78F1C",
        "len-bg": "#FBE8C4",
        shr: "#A07C12",
        "shr-bg": "#F2E5B2",
        clu: "#D96F1F",
        "clu-bg": "#FBDFC4",
        ons: "#2D8AA8",
        "ons-bg": "#D6EEF5"
      }
    }
  },
  plugins: []
};

export default config;
