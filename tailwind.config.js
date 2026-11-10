/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: {
            light: '#ff4d4d',
            DEFAULT: '#c41e3a',
            dark: '#8b0000',
            deep: '#5a0a0a',
          },
          green: {
            light: '#2e8b57',
            DEFAULT: '#165b33',
            dark: '#0f3e23',
            deep: '#072414',
          },
          gold: {
            light: '#ffe066',
            DEFAULT: '#f1b72e',
            dark: '#c68b0f',
            metallic: '#d4af37',
          },
          snow: '#f8fafc',
          cream: '#fdfbf7',
          night: '#0a0f1d',
        }
      },
      fontFamily: {
        serif: ['"Cinzel Decorative"', 'Georgia', 'serif'],
        festive: ['"Mountains of Christmas"', 'cursive'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 2.5s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(241, 183, 46, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(241, 183, 46, 0.85)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

