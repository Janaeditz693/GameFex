/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        surface: "#161B22",
        card: "#1E2430",
        primary: "#00E5FF",
        success: "#6CFF6C",
        danger: "#FF5C5C",
        warning: "#FFB000",
      },
      borderRadius: {
        'button': '12px',
        'card': '20px',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 229, 255, 0.15)',
        'glow-primary-heavy': '0 0 35px rgba(0, 229, 255, 0.4)',
        'glow-success': '0 0 20px rgba(108, 255, 108, 0.2)',
        'glow-danger': '0 0 20px rgba(255, 92, 92, 0.2)',
        'glow-warning': '0 0 20px rgba(255, 176, 0, 0.2)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
