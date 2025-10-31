/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Primary color (maps to saffron for consistency)
        primary: {
          DEFAULT: '#FF8C42',
          50: '#FFF5ED',
          100: '#FFE8D6',
          200: '#FFD4AD',
          300: '#FFBE84',
          400: '#FFA55B',
          500: '#FF8C42',
          600: '#FF6B0A',
          700: '#D15400',
          800: '#A04200',
          900: '#6F2E00',
          border: '#FFD4AD',
          foreground: '#FFFFFF',
        },
        // Primary Brand Colors
        saffron: {
          DEFAULT: '#FF8C42',
          50: '#FFF5ED',
          100: '#FFE8D6',
          200: '#FFD4AD',
          300: '#FFBE84',
          400: '#FFA55B',
          500: '#FF8C42',
          600: '#FF6B0A',
          700: '#D15400',
          800: '#A04200',
          900: '#6F2E00',
        },
        charcoal: {
          DEFAULT: '#2D3436',
          50: '#F5F6F6',
          100: '#E8EAEB',
          200: '#D1D5D7',
          300: '#B3B9BC',
          400: '#8C9498',
          500: '#636E72',
          600: '#4A5356',
          700: '#2D3436',
          800: '#1E2224',
          900: '#0F1112',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          50: '#FFFFFF',
          100: '#FFF8F0',
          200: '#FFF1E0',
          300: '#FFE8CC',
          400: '#FFE0B8',
        },
        // Secondary Brand Colors
        herb: {
          DEFAULT: '#86A873',
          light: '#A3C491',
          dark: '#6B8A5A',
        },
        espresso: {
          DEFAULT: '#6B4423',
          light: '#8A5A2F',
          dark: '#4D301A',
        },
        berry: {
          DEFAULT: '#C85A54',
          light: '#D97A75',
          dark: '#A03F3A',
        },
        // Neutrals
        slate: '#636E72',
        'light-gray': '#DFE6E9',
        // UI Component Colors (for shadcn/ui compatibility)
        background: '#FFF8F0', // cream
        foreground: '#2D3436', // charcoal
        muted: {
          DEFAULT: '#F5F6F6',
          foreground: '#636E72',
        },
        accent: {
          DEFAULT: '#FFE8D6',
          foreground: '#2D3436',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#D1D5D7',
        input: '#D1D5D7',
        ring: '#FF8C42', // saffron for focus states
        secondary: {
          DEFAULT: '#E8EAEB',
          foreground: '#2D3436',
          border: '#D1D5D7',
        },
        sidebar: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D3436',
          accent: '#FFE8D6',
          'accent-foreground': '#2D3436',
          border: '#D1D5D7',
          ring: '#FF8C42',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
