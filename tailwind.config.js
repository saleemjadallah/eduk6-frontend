/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                comic: ['Comic Neue', 'cursive'],
                display: ['Fraunces', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                nanobanana: {
                    yellow: '#FFD700',
                    blue: '#4169E1',
                    green: '#32CD32',
                },
                // Teacher Portal - "Retro Classroom" palette
                teacher: {
                    // Warm cream/paper background
                    cream: '#FDF8F3',
                    paper: '#FAF7F2',
                    // Chalkboard green (nostalgic but modern)
                    chalk: '#2D5A4A',
                    chalkLight: '#3D7A6A',
                    // Warm terracotta accent
                    terracotta: '#C75B39',
                    terracottaLight: '#E8846A',
                    // Deep navy for text
                    ink: '#1E2A3A',
                    inkLight: '#3D4F66',
                    // Warm gold for highlights
                    gold: '#D4A853',
                    goldLight: '#E8C97A',
                    // Soft sage for success states
                    sage: '#7BAE7F',
                    sageLight: '#A8D4AB',
                    // Muted coral for alerts
                    coral: '#E07B6B',
                    // Soft purple for premium features
                    plum: '#7B5EA7',
                    plumLight: '#9D85C4',
                }
            },
            backgroundImage: {
                // Teacher portal gradients
                'teacher-mesh': 'radial-gradient(at 40% 20%, rgba(212,168,83,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(45,90,74,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(199,91,57,0.08) 0px, transparent 50%)',
                'teacher-grid': 'linear-gradient(rgba(30,42,58,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,58,0.03) 1px, transparent 1px)',
                'chalkboard': 'linear-gradient(135deg, #2D5A4A 0%, #1E4035 100%)',
                'paper-texture': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
            },
            boxShadow: {
                'teacher-sm': '0 1px 2px rgba(30,42,58,0.06), 0 1px 3px rgba(30,42,58,0.1)',
                'teacher': '0 4px 6px rgba(30,42,58,0.05), 0 10px 15px rgba(30,42,58,0.1)',
                'teacher-lg': '0 10px 25px rgba(30,42,58,0.08), 0 20px 40px rgba(30,42,58,0.12)',
                'teacher-glow': '0 0 30px rgba(212,168,83,0.2)',
                'card-hover': '0 8px 30px rgba(30,42,58,0.12), 0 4px 8px rgba(30,42,58,0.06)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
