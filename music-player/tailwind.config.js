/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kpop: {
          50: "#fff5fa",
          100: "#ffe6f3",
          200: "#ffc1df",
          300: "#ff9bca",
          400: "#ff54a4",
          500: "#ff1680",
          600: "#e8006e",
          700: "#c2005c",
          800: "#9c004a",
          900: "#7d003d",
        },
      },
    },
  },
  plugins: [],
};
