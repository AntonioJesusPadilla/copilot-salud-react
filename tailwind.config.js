/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidad corporativa
        primary: '#1FB6C3',
        secondary: '#1E3A5F',
        accent: '#20B2AA',
        // Roles
        admin: '#FF6B6B',      // Rojo - Administrador
        gestor: '#4A90E2',     // Azul - Gestor
        analista: '#7B68EE',   // Púrpura - Analista
        invitado: '#9CA3AF'    // Gris - Invitado
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
