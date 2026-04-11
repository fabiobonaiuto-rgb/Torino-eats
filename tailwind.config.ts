import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        granata: {
          50: "#faf5f6",
          100: "#f5ebed",
          200: "#e8d1db",
          300: "#dab7c9",
          400: "#c183a5",
          500: "#a81c39",
          600: "#8b1830",
          700: "#6e1527",
          800: "#541120",
          900: "#3d0c17",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
