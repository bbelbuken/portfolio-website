import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
