/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "var(--color-dark)",
        "dark-secondary": "var(--color-dark-secondary)",
        "dark-accent": "var(--color-dark-accent)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        white: "var(--color-white, #ffffff)",
        black: "var(--color-black, #000000)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
