// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: false,
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // UPDATED: Define font families using the CSS variables from layout.tsx
            fontFamily: {
                sans: ['var(--font-inter)'], // Sets the default sans-serif font
                inter: ['var(--font-inter)'],
                lato: ['var(--font-lato)'],
                'source-code-pro': ['var(--font-source-code-pro)'],
                poppins: ['var(--font-poppins)'],
                'roboto-mono': ['var(--font-roboto-mono)'],
                'playfair-display': ['var(--font-playfair-display)'],
                lora: ['var(--font-lora)'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;