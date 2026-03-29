/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          primary: "#4CAF50",
          primaryDark: "#388E3C",
          secondary: "#4FC3F7",
          accent: "#FFD54F",
          accentOrange: "#FFB74D",
          mint: "#C8E6C9",
          pale: "#E8F5E9",
        },
      },
      fontFamily: {
        display: ["Fredoka", "Nunito", "Poppins", "sans-serif"],
        body: ["Nunito", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(76, 175, 80, 0.15)",
        "soft-lg": "0 8px 30px rgba(76, 175, 80, 0.2)",
        card: "0 4px 24px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 12px 40px rgba(76, 175, 80, 0.2)",
      },
    },
  },
  plugins: [],
};
