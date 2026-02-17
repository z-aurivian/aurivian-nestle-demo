/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aurivian': {
          'black': '#111111',
          'dark-gray': '#2D2C2C',
          'gray': '#8D8C8C',
          'light-gray': '#E3E3E3',
          'white': '#FAFAFA',
          'blue': '#00A8FF',
          'purple': '#9D4EDD',
          'pink': '#FF3CAC',
          'cyan': '#00FFB3',
          'yellow': '#F9E900',
          'red': '#FF3366',
        },
      },
    },
  },
  plugins: [],
}
