/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pretendard: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
      },

      colors: {
        'gomz-black': '#1E1E1E',
        'gomz-gray': {
          800: '#4B4B4B',
          400: '#9F9F9F',
          200: '#EBEBEB',
        },
        'gomz-white': '#FAFAFA',
        'gomz-red': '#FF3B30',
        'gomz-blue': '#4362D0',
      },
    },
  },
  plugins: [],
};
