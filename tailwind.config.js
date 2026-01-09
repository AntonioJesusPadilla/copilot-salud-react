/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar dark mode con clase
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
        invitado: '#4ECDC4'    // Verde azulado - Invitado
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      // Breakpoints personalizados para mobile
      screens: {
        'xs': '375px',  // iPhone SE, pequeños móviles
        'sm': '640px',  // móviles grandes
        'md': '768px',  // tablets
        'lg': '1024px', // laptops pequeñas
        'xl': '1280px', // desktops
        '2xl': '1536px' // pantallas grandes
      }
    },
  },
  plugins: [],
}
