/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        // bg: '#FFC37D',
        primary: '#B7EC5D',
        'primary-dark': '#648D1E',
        'primary-frame': 'rgba(183, 236, 93, 0.3)',
        'primary-linear': 'rgb(183, 236, 93)',
        secondary: '#4D4D4D',
        'secondary-dark': '#222222',
        'secondary-tint': '#f5f5f5',
        success: '#B7EC5D',
        'success-dark': '#648D1E',
        'success-tint': '#D9FF99',
        danger: '#F93819',
        'danger-dark': '#A01600',
        'danger-tint': '#FFA394',
        'pen-black': '#000000',
        'pen-blue': '#0066FF',
        'pen-red': '#f93819',
        gray: {
          10: "#E6E6E6",
          20: "#CCCCCC",
          30: "#B3B3B3",
          40: "#999999",
          50: "#808080",
          60: "#666666",
          70: "#4D4D4D",
          80: "#333333",
          90: "#1A1A1A",
        },
      },
      animation: {},
      keyframes: {},
    },
  },
  plugins: [],
}