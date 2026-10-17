/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'EB Garamond', 'Georgia', 'Cambria', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        parchment: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F3EFEA',
          300: '#E7E1D8',
          400: '#D5CCBF',
        },
        ink: {
          900: '#151515',
          800: '#222222',
          700: '#383838',
          600: '#525252',
          500: '#737373',
          400: '#9E9E9E',
        },
        aesop: {
          amber: '#A3662A',
          copper: '#B87333',
          olive: '#4A5340',
          terracotta: '#9E4733',
        }
      }
    },
  },
  plugins: [],
};
