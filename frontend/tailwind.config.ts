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
        // ZenWA Custom Design Tokens
        forest: {
          DEFAULT: "#0E3B26", // Primary App Color
          light: "#174F33",   // Hover states
        },
        lime: {
          DEFAULT: "#D6F35A", // Accent & CTA
          soft: "#F1FAD0",    // AI callouts / active backgrounds
        },
        neutral: {
          soft: "#F6F7F4",    // Dashboard background
        }
      },
      boxShadow: {
        'organic': '0 14px 34px 14px rgba(14,59,38,0.05)',
      }
    },
  },
  plugins: [],
};
export default config;