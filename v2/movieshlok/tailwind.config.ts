import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primarybg: "var(--primary-bg)",
        secondarybg: "var(--secondary-bg)",
        primaryfg: "var(--primary-fg)",
        secondaryfg: "var(--secondary-fg)",
        shadow: "var(--shadow)",
      },
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
