/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kairos: {
          bg: '#0B1120', // Very dark navy/slate
          surface: '#151E32', // Slightly lighter for cards
          blue: '#00F0FF', // Electric Blue
          red: '#FF2A6D', // Critical/Error
          orange: '#FF9F1C', // Warning
          green: '#05D5AA', // Healthy
          text: '#E2E8F0', // Slate 200
          muted: '#94A3B8', // Slate 400
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
