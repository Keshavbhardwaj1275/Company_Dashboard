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
        brand: {
          yellow: '#FFE956',
          'yellow-hover': '#FDE047',
          orange: '#F3740F',
          green: '#288F3D',
          blue: '#158AF4',
          cyan: '#52A3C1',
          navy: '#0F2A4A',
          dark: '#070A13',
          darkcard: 'rgba(15, 23, 42, 0.75)',
        },
        chip: {
          'success-bg': '#BEF1CA',
          'success-text': '#1F7A35',
          'danger-bg': '#F7C9C6',
          'danger-text': '#B42318',
          'warning-bg': '#FDE2C8',
          'warning-text': '#B45309',
          'info-bg': '#DBEAFE',
          'info-text': '#1E40AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'frame': '32px',
        'card': '20px',
        'inner': '14px',
        'chip': '6px',
      },
      boxShadow: {
        'frame': '0 30px 80px -20px rgba(15, 23, 42, 0.18)',
        'glass-card': '0 8px 32px rgba(15, 23, 42, 0.05)',
        'glass-card-hover': '0 12px 36px rgba(15, 23, 42, 0.08)',
        'yellow-cta': '0 4px 14px rgba(255, 233, 86, 0.4)',
      },
      backdropBlur: {
        'card': '12px',
        'inner': '8px',
        'ctrl': '6px',
      }
    },
  },
  plugins: [],
}
