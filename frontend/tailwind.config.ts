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
          DEFAULT: '#FFFFFF',
          dark: '#E0E0E0',
        },
        accent: {
          DEFAULT: '#FFFFFF',
          secondary: '#E0E0E0',
        },
        dark: {
          bg: '#0A0A0A',
          card: '#111111',
          input: '#1A1A1A',
          elevated: '#222222',
          surface: '#161616',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#888888',
          muted: '#555555',
        },
        success: '#4CAF50',
        danger: '#E53935',
        warning: '#FFB300',
        info: '#42A5F5',
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.15)',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Pretendard Variable', 'Pretendard', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
