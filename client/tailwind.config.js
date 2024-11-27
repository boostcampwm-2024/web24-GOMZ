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
          900: '#353535',
          800: '#4B4B4B',
          700: '#686868',
          600: '#838383',
          500: '#919191',
          400: '#9F9F9F',
          300: '#C5C5C5',
          200: '#EBEBEB',
          100: '#F8F8F8',
        },
        'gomz-white': '#FAFAFA',
        'gomz-red': '#FF3B30',
        'gomz-blue': '#4362D0',
      },
    },
  },
  plugins: [],
};
