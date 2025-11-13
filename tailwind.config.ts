import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B4965",
          foreground: "#ffffff"
        },
        accent: {
          DEFAULT: "#CAE9FF",
          foreground: "#0B132B"
        }
      }
    }
  },
  plugins: []
};

export default config;

