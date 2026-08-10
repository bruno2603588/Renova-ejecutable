/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        renova: {
          bg: '#F1E9DB',
          tarjeta: '#FFFDF9',
          texto: '#2C231A',
          precio: '#1A1510',
          borde: '#E3dac9',
        },
      },
    },
  },
  plugins: [],
}