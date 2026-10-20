/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gok: {
          lightBg: "#f4f6fa",
          darkBg: "#0b0f19",
          slate: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
          },
          emerald: {
            500: "#10b981",
            600: "#059669",
            700: "#047857",
          },
          marine: {
            400: "#38bdf8",
            500: "#0284c7",
            600: "#0369a1",
          },
          amber: {
            500: "#f59e0b",
            600: "#d97706",
          },
          crimson: {
            500: "#ef4444",
            600: "#dc2626",
            700: "#b91c1c",
          }
        }
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'SF Pro Display'", "sans-serif"],
      },
      borderRadius: {
        card: "22px",
        nav: "32px",
      },
      boxShadow: {
        "liquid-light": "0 14px 34px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        "liquid-dark": "0 18px 40px -8px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
        "nav-float-light": "0 18px 45px -8px rgba(15, 23, 42, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
        "nav-float-dark": "0 22px 50px -8px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.22)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      }
    },
  },
  plugins: [],
};
