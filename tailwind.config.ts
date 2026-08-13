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
        espresso:  '#0A0A0A',   // near-black — base background, primary text
        taupe:     '#3A3A3A',   // Spectral Smoke — borders, muted UI, dividers
        champagne: '#8B7FD6',   // Violet-Black — sparing accent on badges/highlights, brightened slightly so it reads on dark bg instead of disappearing
        // New depth tones — used for layered surfaces instead of one flat card color
        obsidian2: '#141414',   // one step up from base background, for stacked cards
        obsidian3: '#202020',   // two steps up, for the topmost layer (modals, hover states)
        glow:      '#FF2D4D',   // pure glow red — ONLY used in box-shadow/blur, never as a fill or text color
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Layered card depth — subtle top highlight + deep shadow, instead
        // of a flat 1px border, so surfaces look like they sit above the
        // background rather than pasted flat onto it.
        'card': 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 12px 24px -8px rgba(0,0,0,0.6)',
        'card-hover': 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 16px 32px -8px rgba(0,0,0,0.7)',
        // Blood-red glow for primary CTAs — this is the single biggest
        // fix for "looks pale/generic": a flat red button reads cheap,
        // a glowing one reads premium/intentional.
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
