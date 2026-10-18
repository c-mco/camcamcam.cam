/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Cooper Black', 'Recoleda', 'Georgia', 'serif'],
        sans: ['Outfit', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        cream: {
          50: '#FFFEFA',
          100: '#FAF4E8',
          200: '#F5EADB',
          300: '#EADDC7',
          400: '#DCC8A7',
        },
        mustard: {
          100: '#FDF5DF',
          200: '#F9E6B5',
          300: '#F4D486',
          400: '#EBBF50',
          500: '#D99B26', // signature funky 70s mustard
          600: '#B87E17',
          700: '#915F0D',
        },
        espresso: {
          100: '#EFE7E0',
          200: '#DDCFC4',
          300: '#BCA290',
          400: '#87644E',
          500: '#664938',
          600: '#4A3326',
          700: '#38251B',
          800: '#281A12',
          900: '#1A110B', // rich 70s dark roast brown
          950: '#120B07',
        },
        rust: {
          100: '#FCECE6',
          300: '#EBB49E',
          400: '#DD8464',
          500: '#C85A32', // warm 70s burnt orange / terracotta
          600: '#A7421E',
          700: '#853215',
        },
        avocado: {
          100: '#F2F5EC',
          300: '#C2D1A9',
          500: '#6B7A4C', // 70s olive / avocado green
          600: '#54613B',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
