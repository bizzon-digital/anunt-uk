import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
      },
      fontSize: {
        'xs': ['0.8rem', { lineHeight: '1.2rem' }],
        'sm': ['0.95rem', { lineHeight: '1.4rem' }],
        'base': ['1.05rem', { lineHeight: '1.6rem' }],
        'lg': ['1.15rem', { lineHeight: '1.75rem' }],
        'xl': ['1.3rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.55rem', { lineHeight: '2rem' }],
      },
    },
  },
  plugins: [],
};
export default config;