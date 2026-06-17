/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14B8A6',
          dark: '#0D9488',
          light: '#2DD4BF'
        }
      }
    },
  },
  plugins: [],
}
