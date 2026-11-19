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
        cream: {
          50: "#FFFDF9",
          100: "#FDF8F0",
          200: "#F7EDE0",
        },
        blush: {
          50: "#FDF4F7",
          100: "#F8E8EE",
          200: "#F2D1DC",
          300: "#E8B4C6",
          500: "#D47494",
        },
        cocoa: {
          50: "#F6F1EE",
          100: "#E8DDD6",
          300: "#B89A89",
          500: "#7A5440",
          700: "#5C3D2E",
          900: "#3D261C",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        display: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
