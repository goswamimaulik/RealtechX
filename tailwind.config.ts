import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', md: '1.5rem', lg: '2rem' }, screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        ink: { DEFAULT: '#0B1020', 800: '#121A2E', 700: '#1A2440', 600: '#24304F' },
        gold: { DEFAULT: '#C9A45C', light: '#E7D3A4', dark: '#A8843F', 50: '#FBF6EA' },
        ivory: { DEFAULT: '#FAF7F1', 200: '#F3EDE2', 300: '#E9E0D0' },
        muted: '#6B7280',
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        luxe: '0 20px 50px -20px rgba(11,16,32,0.25)',
        card: '0 8px 30px -12px rgba(11,16,32,0.18)',
        gold: '0 10px 30px -10px rgba(201,164,92,0.55)',
      },
      backgroundImage: {
        'gold-grad': 'linear-gradient(135deg,#E7D3A4 0%,#C9A45C 45%,#A8843F 100%)',
        'ink-grad': 'linear-gradient(160deg,#121A2E 0%,#0B1020 60%)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        zoomIn: { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        slideInRight: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        slideOutRight: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(100%)' } },
        sheetUp: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
      },
      animation: {
        fadeUp: 'fadeUp .7s ease both',
        marquee: 'marquee 40s linear infinite',
        zoomIn: 'zoomIn .25s ease both',
        fadeIn: 'fadeIn .25s ease both',
        fadeOut: 'fadeOut .25s ease both',
        slideInRight: 'slideInRight .3s cubic-bezier(.2,.8,.2,1) both',
        slideOutRight: 'slideOutRight .26s ease-in both',
        sheetUp: 'sheetUp .35s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
