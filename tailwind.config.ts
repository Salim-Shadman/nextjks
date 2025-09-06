// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... (your existing darkMode, content, theme sections)
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"), // <-- ADD THIS LINE
  ],
}