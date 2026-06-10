/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#fbc02d',  // <- A fő szín amit kértél
          600: '#f9a825',
          700: '#f57f17',
          800: '#e65100',
          900: '#bf360c',
        }
      },
      // Globális betűtípus: Montserrat (CSS-változón át, app/layout.tsx-ből).
      // A Tailwind preflight a html elemre 'theme(fontFamily.sans)'-t alkalmaz, így
      // minden oldal és komponens ezt örökli automatikusan.
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', '"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
