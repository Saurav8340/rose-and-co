import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      colors: {
        ivory:     '#FAF6F0',
        blush:     '#F4DCD6',
        rose:      '#B03A4C',
        wine:      '#5C1A2B',
        espresso:  '#2B1810',
        taupe:     '#8B7568',
        champagne: '#D4C4A0',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
