/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050508', // Deep pitch void black
        surface: '#0B0914',    // Dark obsidian purple card surface
        border: '#23183D',     // Subdued purple border
        brand: {
          500: '#9D4EDD',      // Luminous Purple
          400: '#C77DFF',      // Neon Violet Accent
          300: '#E0AAFF',      // Soft Glow Text
          glow: '#7B2CBF',     // Shadow Glow Engine
        },
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(157, 78, 221, 0.35)',
        'purple-card': '0 4px 20px -2px rgba(123, 44, 191, 0.25)',
      },
    },
  },
  plugins: [],
};