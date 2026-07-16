/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'tki': {
          'red': '#C41E3A',
          'dark-red': '#8B0000',
          'blue': '#1B3A5C',
          'dark-blue': '#0D1F33',
          'navy': '#0A1628',
          'white': '#FFFFFF',
          'light': '#F8F9FA',
          'gray': '#E9ECEF',
          'dark-gray': '#6C757D',
          'black': '#1A1A2E',
        }
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
