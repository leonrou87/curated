import type { Config } from "tailwindcss";

// Tailwind theme consumes the CSS variables from app/globals.css (tokens from DESIGN-SYSTEM.md).
// Nothing ad-hoc: colors/space/radius all reference tokens.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        positive: "var(--positive)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        serif: "var(--serif)",
        sans: "var(--sans)",
        mono: "var(--mono)",
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
