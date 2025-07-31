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
    'fill-red-400',
    'fill-green-400',
    'fill-red-500',
    'fill-green-500',
    'text-red-400',
    'text-green-400',
    'text-red-500',
    'text-green-500',
    'animate-win-pulse',
    'animate-lose-pulse',
    'animate-text-glow',
    'animate-ping',
    'text-white',
    'text-gray-200',
    'text-gray-400',
    'text-gray-600',
    'text-gray-800',
  ],
  darkMode: "media", // or 'class'
  theme: {
    extend: {
      animation: {
        'win-pulse': 'winPulse 1s ease-in-out',
        'lose-pulse': 'losePulse 1s ease-in-out',
        'text-glow': 'textGlow 2s ease-in-out infinite',
        'ping': 'ping 0.5s cubic-bezier(0,0,0.2,1) 1'
      },
      keyframes: {
        winPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.9' }
        },
        losePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.95)', opacity: '0.8' }
        },
        textGlow: {
          '0%, 100%': { 'text-shadow': '0 0 5px rgba(255,255,255,0.5)' },
          '50%': { 'text-shadow': '0 0 15px rgba(255,255,255,1)' }
        },
        ping: {
          '75%, 100%': { transform: 'scale(1.1)', opacity: '0' }
        }
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
