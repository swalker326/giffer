/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%": { transform: "rotate(2deg)" },
          "45%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
          "75%": { transform: "rotate(-2deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out",
      },
    },
  },
  plugins: [],
};
