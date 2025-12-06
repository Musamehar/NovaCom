/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#0B0B15',       // Deepest background
        'nebula-blue': '#1A1A2E',      // Lighter background
        'cyan-supernova': '#00F0FF',   // Glowing text/logos
        'cosmic-purple': '#6C63FF',    // Primary buttons
        'deep-void': '#151525',        // Input fields
        'glass-white': 'rgba(255, 255, 255, 0.1)', // Glass effect
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],   // For Headings
        'montserrat': ['Montserrat', 'sans-serif'], // For Body text
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom right, #0B0B15, #1A1A2E)',
      },
      dropShadow: {
        'glow': '0 0 10px rgba(0, 240, 255, 0.5)', // Neon glow effect
      }
    },
  },
  plugins: [],
}