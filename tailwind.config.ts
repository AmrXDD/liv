import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "3rem", xl: "4rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // Brand
        forest: {
          50: "#eaf5ef",
          100: "#cee9d8",
          200: "#9bd3b1",
          300: "#5fb487",
          400: "#2d8e60",
          500: "#006c45", // Primary
          600: "#005a3a",
          700: "#00472f",
          800: "#003423",
          900: "#001a11",
        },
        coral: {
          50: "#fff1f1",
          100: "#ffdcdc",
          200: "#ffb9b9",
          300: "#ff8e8e",
          400: "#ff7373",
          500: "#ff5757", // Secondary
          600: "#e64646",
          700: "#bf3434",
          800: "#962525",
          900: "#601515",
        },
        bone: {
          50: "#fbf9f5",
          100: "#f5f1ea",
          200: "#ece5d6",
          300: "#dccfb2",
          400: "#c2b08a",
          500: "#a89160",
        },
        ink: {
          DEFAULT: "#0a1612",
          soft: "#1a2723",
          muted: "#3a4a44",
        },
        // Semantic surfaces (light/dark via class)
        surface: {
          base: "#fbf9f5",
          raised: "#ffffff",
          sunken: "#f1ede4",
          inverse: "#0a1612",
        },
      },
      fontFamily: {
        sans: ['"Cairo"', '"Inter"', "system-ui", "sans-serif"],
        display: ['"Cairo"', '"Inter"', "system-ui", "sans-serif"],
        serif: ['"Cairo"', '"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // Editorial scale
        "display-2xl": ["clamp(3.5rem, 8vw, 8rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-xl": ["clamp(2.75rem, 6vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.18em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        none: "0",
        sm: "0.375rem",
        DEFAULT: "0.625rem",
        md: "0.875rem",
        lg: "1.25rem",
        xl: "1.75rem",
        "2xl": "2.5rem",
        "3xl": "3.5rem",
      },
      boxShadow: {
        elevation: "0 30px 60px -20px rgba(0, 50, 30, 0.18), 0 8px 20px -8px rgba(0, 50, 30, 0.12)",
        glow: "0 0 0 1px rgba(0,108,69,0.08), 0 30px 60px -20px rgba(0,108,69,0.25)",
        coral: "0 30px 60px -20px rgba(255,87,87,0.45)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.04)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        "radial-forest": "radial-gradient(1200px 600px at 20% 10%, rgba(0,108,69,0.18), transparent 60%), radial-gradient(800px 600px at 90% 80%, rgba(255,87,87,0.12), transparent 60%)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
