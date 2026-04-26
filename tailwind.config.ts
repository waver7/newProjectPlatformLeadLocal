import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          500: '#3856ff',
          700: '#243fc2'
        }
      }
    }
  },
  plugins: []
};

export default config;
