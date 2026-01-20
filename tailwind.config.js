export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 50%, 55%)',
        secondary: 'hsl(210, 30%, 40%)',
        accent: 'hsl(45, 90%, 55%)',
        background: 'hsl(210, 20%, 10%)',
        surface: 'hsl(210, 20%, 15%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

