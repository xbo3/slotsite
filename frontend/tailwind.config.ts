import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1475E1',
          dark: '#0F5FBF',
        },
        accent: {
          DEFAULT: '#00E701',
          gold: '#FFD700',
          blue: '#1475E1',
          purple: '#8B5CF6',
        },
        dark: {
          bg: '#0F1923',
          card: '#1A2C38',
          input: '#213743',
          elevated: '#2F4553',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B1BAD3',
          muted: '#557086',
        },
        success: '#00E701',
        danger: '#F0443C',
        warning: '#FFB800',
        border: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
