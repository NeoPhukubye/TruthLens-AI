/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#222240',
          500: '#2d2d4a',
          400: '#3d3d5c',
          300: '#5c5c7a',
          200: '#8888a4',
          100: '#b4b4cc',
        },
        accent: {
          blue: '#4f8fff',
          cyan: '#06d6a0',
          red: '#ff4757',
          amber: '#ffc048',
          purple: '#a855f7',
        },
        surface: {
          primary: '#12121a',
          secondary: '#1a1a2e',
          tertiary: '#222240',
          elevated: '#2d2d4a',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(79, 143, 255, 0.15)',
        'glow-sm': '0 0 10px rgba(79, 143, 255, 0.1)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
