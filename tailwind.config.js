/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dark: {
          bg: '#1e1e1e',
          surface: '#252526',
          text: '#d4d4d4',
        },
        light: {
          bg: '#ffffff',
          surface: '#fafafa',
          text: '#333333',
        }
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}