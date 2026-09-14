import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        speak: {
          green: "#58CC02",
          greenDark: "#46A302",
          blue: "#1CB0F6",
          blueDark: "#0E90D4",
          purple: "#CE82FF",
          purpleDark: "#A568D6",
          yellow: "#FFC800",
          orange: "#FF9600",
          red: "#FF4B4B",
          bg: "#F7F9FB",
          ink: "#3C3C3C",
          muted: "#777777",
          card: "#FFFFFF",
          border: "#E5E5E5",
        },
      },
      fontFamily: {
        sans: [
          "'Nunito'",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 0 0 rgba(0,0,0,0.06)",
        button: "0 4px 0 0",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.2s ease-out",
        bounceIn: "bounceIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
