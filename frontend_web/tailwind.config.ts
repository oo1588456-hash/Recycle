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
        recycle: {
          primary: "#15803D",
          "primary-dark": "#166534",
          mint: "#DCFCE7",
          charcoal: "#111827",
          muted: "#6B7280",
          surface: "#F9FAFB",
          border: "#E5E7EB",
          warning: "#F59E0B",
          error: "#DC2626",
          success: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(17, 24, 39, 0.08)",
        lift: "0 12px 40px -12px rgba(22, 101, 52, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
