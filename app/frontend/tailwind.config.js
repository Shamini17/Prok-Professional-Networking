/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        'primary-hover': '#1d4ed8', // blue-700
        secondary: '#6366f1', // indigo-500
      },
    },
  },
  plugins: [],
} 