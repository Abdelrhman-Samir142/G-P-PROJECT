import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: '#FFF0EA',
          100: '#FFE1D5',
          200: '#FFC2AB',
          300: '#FFA482',
          400: '#FF8558',
          500: '#FF6B35', // Dark Premium Orange
          600: '#E65A28',
          700: '#CC4A1B',
          800: '#A63610',
          900: '#8A2608',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          50: '#FFFDE6',
          100: '#FFFACC',
          200: '#FFF599',
          300: '#FFEF66',
          400: '#FFEA33',
          500: '#FFD700', // Gold
          600: '#DBA800',
          700: '#B88600',
          800: '#8F6600',
          900: '#6B4A00',
        }
      },
      /* REDESIGN: Font family with Playfair Display + Outfit + Cairo */
      fontFamily: {
        sans: ['var(--font-outfit)', 'var(--font-cairo)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-playfair)', 'sans-serif'],
        arabic: ['var(--font-cairo)', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
