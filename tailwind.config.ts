import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Brand Colors ────────────────────────────────────────────────────
      colors: {
        brand: {
          50: '#f0f0ff',
          100: '#e4e3ff',
          200: '#cccbff',
          300: '#a9a5ff',
          400: '#837bfc',
          500: '#6453f8',
          600: '#5133f0',
          700: '#4424dc',
          800: '#391eb8',
          900: '#301c97',
          950: '#1c0f67',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8f7ff',
          tertiary: '#f0eeff',
          border: '#e4e3ff',
          'border-strong': '#cccbff',
          dark: '#0f0e1a',
          'dark-secondary': '#1a1829',
          'dark-tertiary': '#241f3a',
          'dark-border': '#2e2950',
          'dark-border-strong': '#3d3870',
        },
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },

      // ─── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ─── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(100 83 248 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        modal: '0 20px 60px -10px rgb(0 0 0 / 0.2), 0 8px 24px -4px rgb(0 0 0 / 0.12)',
        brand: '0 4px 14px 0 rgb(100 83 248 / 0.3)',
        'brand-lg': '0 8px 28px 0 rgb(100 83 248 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
        glow: '0 0 20px rgb(100 83 248 / 0.2)',
      },

      // ─── Animations ──────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-4px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        spin: 'spin 1s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        bounce: 'bounce 1s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },

      // ─── Background ──────────────────────────────────────────────────────
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6453f8 0%, #837bfc 50%, #14b8a6 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, #f0f0ff 0%, #f0fdfa 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1829 0%, #0f0e1a 100%)',
        shimmer:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ─── Z-index ─────────────────────────────────────────────────────────
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};

export default config;
