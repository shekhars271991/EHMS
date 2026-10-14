/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        od: {
          light: '#ecfdf5',
          DEFAULT: '#059669', // Emerald green for Right Eye (OD)
          dark: '#064e3b',
        },
        os: {
          light: '#f0f9ff',
          DEFAULT: '#0284c7', // Sky blue for Left Eye (OS)
          dark: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
