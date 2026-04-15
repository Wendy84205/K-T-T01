/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050816",
          primary: "#06b6d4",
          secondary: "#a855f7",
          accent: "#00f5ff",
          surface: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        },
        tl: {
          bg: "#0F172A",
          surface: "#1E293B",
          hover: "#334155",
          border: "#334155",
          primary: "#6366F1",
          primaryDark: "#4F46E5",
          primaryLight: "#A5B4FC",
          text: "#F8FAFC",
          muted: "#94A3B8",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444"
        }
      }
    },
  },
  plugins: [],
}
