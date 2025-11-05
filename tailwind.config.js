/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'eco-green': '#10B981',
        'eco-green-dark': '#059669',
        'eco-green-start': '#34D399',
        'eco-green-end': '#10B981',
        'eco-accent-start': '#FBBF24',
        'eco-accent-end': '#F59E0B',
        'eco-light': '#F9FAFB',
        'eco-dark': '#1F2937',
        'eco-secondary': '#6B7280',
      }
    }
  },
  plugins: [],
}
