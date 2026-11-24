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
          base: "#FBFAF7",
          muted: "#F6F4F1",
          dark: "#F1EEE8",
        },
        card: {
          base: "#FFFFFF",
          header: "#F8F6F2",
        },
        text: {
          primary: "#2C2C2C",
          secondary: "#7A7A7A",
          tertiary: "#999999",
          disabled: "#B5B5B5",
        },
        accent: {
          base: "#8B9469",
          light: "#A8AD8B",
          soft: "#F0EBE3",
          orange: "#D97706",
          orangeLight: "#FEF3E2",
        },
        success: "#6B9B76",
        error: "#C67B7B",
        border: {
          subtle: "#EFEAE3",
          tag: "#D4D0C8",
          tagSelected: "#A68A64",
        },
        tag: {
          bg: "transparent",
          selectedBg: "#F0EBE3",
          selectedBorder: "#A68A64",
        },
        meal: {
          breakfast: "#FEF3E2",
          lunch: "#E8F5E9",
          dinner: "#EDE7F6",
        },
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 10px 28px rgba(0,0,0,0.045)",
        soft: "0 6px 18px rgba(0,0,0,0.05)",
        btn: "0 4px 14px rgba(0,0,0,0.05)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      letterSpacing: {
        wide: "0.5px",
        wider: "1px",
        widest: "1.5px",
      },
    },
  },
  plugins: [],
};

export default config;
