import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        blush:      '#F4DCD6',
        rose:       '#B03A4C',
        champagne:  '#E8D5B7',
        wine:       '#5C1A2B',
        ivory:      '#FAF6F0',
        taupe:      '#8B7568',
        espresso:   '#2B1810',
      },
      fontFamily: {
        display: ['Georgia', 'Didot', 'serif'],
        italiana: ['Georgia', 'serif'],
        sans:    ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn .5s ease-out',
        'slide-up': 'slideUp .4s ease-out',
        'marquee':  'marquee 25s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
export default config;
