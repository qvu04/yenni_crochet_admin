/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF7F1',
        blush: '#F8B7C1',
        berry: '#9F5161',
        cocoa: '#4F3F46',
        muted: '#8B727A',
        mint: '#CFE8D8',
        ink: '#2F252A',
      },
      boxShadow: {
        soft: '0 16px 40px rgba(79, 63, 70, 0.10)',
      },
      borderRadius: {
        admin: '18px',
      },
    },
  },
  plugins: [],
}
