/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "2rem",
                lg: "4rem",
                xl: "5rem",
                "2xl": "6rem",
            },
        },
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                "brand-secondary": "#5DA4D4",
                "brand-primary": "#6FB62C",
                "brand-primary-accent": "#5F9B25",
                "brand-dark": "#000102",
                "brand-muted-light": "#999999",
                "brand-muted": "#616161",
                "brand-muted-dark": "#565656",
                "brand-danger": "#FF3E30",
                "brand-danger-muted": "#e5e5e5",
                "brand-danger-accent": "#E30F00",
                "brand-safe": "#5DA4D4",
                "brand-safe-accent": "#2F7FB4",
                "brand-disabled-light": "#cccdcc",
                "brand-disabled-dark": "#777777",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
