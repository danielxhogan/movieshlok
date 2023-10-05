import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      primarybg: "var(--primary-bg)",
      secondarybg: "var(--secondary-bg)",
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
