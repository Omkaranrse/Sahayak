import type { Config } from "tailwindcss";

// Design tokens are defined as CSS variables in app/globals.css (RGB channel triplets),
// then referenced here via rgb(var(--token) / <alpha-value>) so opacity utilities
// (bg-primary/10 etc.) keep working, and dark mode is a single class swap.
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: withOpacity("--surface-bg"),
        surface: withOpacity("--surface"),
        "surface-raised": withOpacity("--surface-raised"),
        "surface-sunken": withOpacity("--surface-sunken"),
        outline: withOpacity("--outline"),
        "outline-soft": withOpacity("--outline-soft"),

        // Text
        ink: withOpacity("--ink"),
        "ink-soft": withOpacity("--ink-soft"),
        "ink-faint": withOpacity("--ink-faint"),

        // Brand — deep indigo, the civic/trust anchor
        primary: {
          DEFAULT: withOpacity("--primary-500"),
          50: withOpacity("--primary-50"),
          100: withOpacity("--primary-100"),
          200: withOpacity("--primary-200"),
          300: withOpacity("--primary-300"),
          400: withOpacity("--primary-400"),
          500: withOpacity("--primary-500"),
          600: withOpacity("--primary-600"),
          700: withOpacity("--primary-700"),
          800: withOpacity("--primary-800"),
          900: withOpacity("--primary-900"),
        },

        // Eligible / positive state
        emerald: {
          DEFAULT: withOpacity("--emerald-500"),
          100: withOpacity("--emerald-100"),
          500: withOpacity("--emerald-500"),
          600: withOpacity("--emerald-600"),
        },

        // Near-miss / attention state
        amber: {
          DEFAULT: withOpacity("--amber-500"),
          100: withOpacity("--amber-100"),
          500: withOpacity("--amber-500"),
          600: withOpacity("--amber-600"),
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "Manrope", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-plex-mono)", "IBM Plex Mono", "monospace"],
      },
      fontSize: {
        // Material 3 inspired type scale, tuned for this product
        "display-lg": ["3.25rem", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["2.5rem", { lineHeight: "1.12", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" }],
        "title-lg": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "title-md": ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.65", fontWeight: "400" }],
        "body-md": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        label: ["0.8125rem", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.01em" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.01em" }],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        seal: "50% 50% 48% 52% / 52% 48% 52% 48%", // organic stamp shape for the signature badge
      },
      boxShadow: {
        "tonal-1": "0 1px 2px 0 rgb(27 33 88 / 0.06), 0 1px 1px 0 rgb(27 33 88 / 0.04)",
        "tonal-2": "0 4px 12px -2px rgb(27 33 88 / 0.10), 0 2px 4px -2px rgb(27 33 88 / 0.06)",
        "tonal-3": "0 12px 32px -8px rgb(27 33 88 / 0.16), 0 4px 8px -4px rgb(27 33 88 / 0.08)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "seal-stamp": {
          "0%": { opacity: "0", transform: "scale(1.4) rotate(-8deg)" },
          "60%": { opacity: "1", transform: "scale(0.94) rotate(2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "seal-stamp": "seal-stamp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
