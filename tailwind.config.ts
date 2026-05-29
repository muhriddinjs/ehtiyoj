import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#38BDF8",
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
        },
        dark: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#040D1F",
        },
        surface: {
          DEFAULT: "#071428",
          2: "#0B1D3A",
          3: "#0F2547",
        },
        emerald: {
          DEFAULT: "#34D399",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        gold: {
          DEFAULT: "#FBBF24",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
        },
        rose: {
          DEFAULT: "#F43F5E",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(56,189,248,0.04) 100%)",
        "gradient-dark": "linear-gradient(180deg, #040D1F 0%, #071428 100%)",
        "gradient-gold": "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
        "gradient-emerald": "linear-gradient(135deg, #059669 0%, #34D399 100%)",
      },
      boxShadow: {
        primary: "0 4px 24px rgba(56,189,248,0.25)",
        "primary-lg": "0 8px 40px rgba(56,189,248,0.35)",
        card: "0 2px 16px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.5)",
        gold: "0 4px 24px rgba(251,191,36,0.3)",
        emerald: "0 4px 24px rgba(52,211,153,0.3)",
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.25s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        "pulse-ring": "pulseRing 1.5s ease-out infinite",
        "compass-spin": "compassSpin 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        compassSpin: {
          "0%": { transform: "rotate(-5deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
