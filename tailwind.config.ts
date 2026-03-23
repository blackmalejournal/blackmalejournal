import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bmj: {
          black:         "#0D0C0B",
          cream:         "#E8DCC8",
          red:           "#C0281F",
          amber:         "#C8852A",
          brown:         "#3B2417",
          tan:           "#B8986A",
          white:         "#F2EDE4",
          // Expanded accent palette
          paper:         "#F0DDBC",
          "deep-black":  "#1C130E",
          crimson:       "#712414",
          "medium-brown":"#5D3F2E",
          olive:         "#416100",
          gold:          "#C77A0E",
          purple:        "#554978",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Bebas Neue'", "sans-serif"],
        body:    ["var(--font-body)",    "Libre Baskerville", "serif"],
        label:   ["var(--font-label)",   "Oswald", "sans-serif"],
        mono:    ["var(--font-mono)",    "IBM Plex Mono", "monospace"],
      },
      letterSpacing: {
        display:       "var(--tracking-display)",
        section:       "var(--tracking-section)",
        wordmark:      "var(--tracking-wordmark)",
        label:         "var(--tracking-label)",
        "label-lg":    "var(--tracking-label-lg)",
        "label-wide":  "var(--tracking-label-wide)",
        "label-xl":    "var(--tracking-label-xl)",
        "label-max":   "var(--tracking-label-max)",
      },
      fontSize: {
        micro: ["var(--text-micro)", { lineHeight: "1.4" }],
        stamp: ["var(--text-stamp)", { lineHeight: "1.4" }],
      },
      lineHeight: {
        article: "var(--leading-article)",
      },
      maxWidth: {
        content: "1200px",
        article: "720px",
        wide:    "1440px",
      },
      backgroundImage: {
        "grain-texture": "var(--texture-url)",
      },
    },
  },
  plugins: [],
};

export default config;

