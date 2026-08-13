import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      colors: {
        ivory:     '#F0EDE6',   // Bone White — light text on dark backgrounds
        blush:     '#1A1A1A',   // Obsidian — dark card / section background
        rose:      '#8B0000',   // Blood Red — main accent, CTAs, badges
        wine:      '#C41E3A',   // brighter Blood Red for glow/hover — more saturated than rose so it actually reads as "lit up" against near-black
        // NEW — FIX for a real accessibility bug found via PageSpeed
        // Insights: `text-wine` on dark backgrounds (espresso/blush)
        // measures ~3.39:1 contrast, below the 4.5:1 minimum required
        // for normal-sized text (WCAG AA). Failing elements included
        // section labels, prices, and badges across the homepage and
        // product page. `crimson` is the same red hue/family, just
        // brightened (~4.98:1 contrast against #0A0A0A) so it reads
        // clearly without looking out of place next to `wine`.
        // USE `crimson` for TEXT color on dark backgrounds (labels,
        // prices, section headings). KEEP using `wine`/`rose` for
        // backgrounds, borders, and buttons (bg-wine + text-ivory
        // already passes contrast fine — that combo is untouched).
        crimson:   '#E2456A',
        espresso:  '#0A0A0A',   // near-black — base background, primary text color
        taupe:     '#3A3A3A',   // Spectral Smoke — borders, dividers
        champagne: '#8B7FD6',   // Violet-Black — sparing accent only
        obsidian2: '#141414',   // layered surface, one step up from base
        obsidian3: '#202020',   // layered surface, two steps up (modals/hover)
        glow:      '#FF2D4D',   // pure glow red — shadow/blur ONLY, never a fill or text color
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 12px 24px -8px rgba(0,0,0,0.6)',
        'card-hover': 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 16px 32px -8px rgba(0,0,0,0.7)',
        'glow-sm': '0 0 12px 0 rgba(255,45,77,0.35)',
        'glow': '0 0 24px 2px rgba(255,45,77,0.4)',
        'glow-lg': '0 0 40px 4px rgba(255,45,77,0.45)',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 16px 0 rgba(255,45,77,0.3)' },
          '50%': { boxShadow: '0 0 28px 4px rgba(255,45,77,0.5)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
