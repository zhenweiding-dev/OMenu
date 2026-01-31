/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F7',
        'paper-dark': '#F5F4F1',
        card: '#FFFFFF',
        'primary-text': '#2C2C2C',
        'secondary-text': '#7A7A7A',
        'disabled-text': '#B5B5B5',
        accent: '#8B9469',
        'accent-light': '#A8AD8B',
        success: '#6B9B76',
        error: '#C67B7B',
        divider: '#EEEBE6',
        'tag-border': '#D4D0C8',
        'tag-selected-bg': '#F0EBE3',
        'tag-selected-border': '#A68A64',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'tag': '6px',
        'modal': '24px',
      },
      spacing: {
        'safe-bottom': '28px',
      },
      fontSize: {
        'h1': ['26px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['16px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'nav-label': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
        'section-label': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
        'tag': ['13px', { lineHeight: '1.3' }],
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'modal': '0 -4px 20px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
