module.exports = {
  content: [
    ".index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [ // ✅ prevents Tailwind from purging these
    'bg-blue-500',
    'text-white',
    'p-4',
    'text-xl',
    'min-h-screen',
    'flex',
    'items-center',
    'justify-center',
    'bg-gray-900',
  ],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
