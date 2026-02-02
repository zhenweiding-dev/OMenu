import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        paper: {
          base: "#FAF9F7",
          muted: "#F5F4F1",
        },
        card: {
          base: "#FFFFFF",
        },
        text: {
          primary: "#2C2C2C",
          secondary: "#7A7A7A",
          disabled: "#B5B5B5",
        },
        accent: {
          base: "#8B9469",
          light: "#A8AD8B",
          orange: "#D97706",
          orangeLight: "#FEF3E2",
        },
        border: {
          subtle: "#EEEBE6",
          tag: "#D4D0C8",
          tagSelected: "#A68A64",
        },
      },
      borderRadius: {
        xl: "1.25rem",
        lg: "0.75rem",
        md: "0.5rem",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.06)",
        soft: "0 2px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
