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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        odoo: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          500: '#714B67', // Odoo signature purple/plum
          600: '#5e3e56',
          700: '#4c3245',
        },
        surface: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          hover: '#273549'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'glow-success': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
