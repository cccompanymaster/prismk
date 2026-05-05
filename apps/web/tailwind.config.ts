import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Pretendard", "system-ui", "sans-serif"],
      },
      colors: {
        // 16 PRISM-K signature colors (one per pattern)
        pattern: {
          DI: "#7E57C2",
          SN: "#37474F",
          BL: "#FF7043",
          QE: "#1A237E",
          SS: "#EC407A",
          SD: "#212121",
          CH: "#FBC02D",
          RA: "#26A69A",
          SK: "#5D4037",
          TC: "#388E3C",
          LE: "#FFA726",
          CA: "#0288D1",
          WG: "#D84315",
          BC: "#C62828",
          FA: "#00897B",
          GC: "#7CB342",
        },
      },
    },
  },
  plugins: [],
};

export default config;
