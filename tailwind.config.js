module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#8d5a34",
        brand2: "#b78656",
        accent: "#dcc3a3",
        darkbg: "#3a281a"
      },
      boxShadow: {
        glass: "0 18px 50px rgba(90, 62, 38, 0.14)",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        liftUp: {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(183, 134, 86, 0)" },
          "50%": { boxShadow: "0 0 24px rgba(183, 134, 86, 0.25)" },
        },
      },
      animation: {
        "float-in": "floatIn 480ms ease-out both",
        "fade-in": "fadeIn 600ms ease-out both",
        "lift-up": "liftUp 620ms ease-out both",
        "pulse-glow": "pulseGlow 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
