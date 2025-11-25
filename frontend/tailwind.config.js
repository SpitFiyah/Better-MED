/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#121212',
        'primary': '#FFFFFF',
        'secondary': '#BB86FC',
        'accent': '#03DAC6',
        'neu-border': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neu-dark': '4px 4px 0px 0px #FFFFFF',
        'neu-dark-sm': '2px 2px 0px 0px #FFFFFF',
      }
    },
  },
  plugins: [],
}