/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#e11d48',
          600: '#e11d48',
          700: '#be123c',
          accent: '#ff4d6d',
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155'
        }
      }
    },
  },
  plugins: [],
}
