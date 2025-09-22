/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8fd48f',
          400: '#5bb85b',
          500: '#7cb342', // Main Wind Advance green
          600: '#689f38',
          700: '#558b2f',
          800: '#33691e',
          900: '#1b5e20',
        },
        secondary: {
          50: '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#8bc34a', // Lighter complementary green
          600: '#7cb342',
          700: '#689f38',
          800: '#558b2f',
          900: '#33691e',
        },
        accent: {
          50: '#e8f5e8',
          100: '#c8e6c8',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50', // Brighter green for highlights
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        }
      }
    },
  },
  plugins: [],
};