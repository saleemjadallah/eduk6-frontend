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
            },
            colors: {
                nanobanana: {
                    yellow: '#FFD700',
                    blue: '#4169E1',
                    green: '#32CD32',
                }
            }
        },
    },
    plugins: [],
}
