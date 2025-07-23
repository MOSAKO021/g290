/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'move-pupil': 'movePupil 3s infinite alternate',
      },
      keyframes: {
        movePupil: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -10px)' },
          '50%': { transform: 'translate(-10px, 10px)' },
          '75%': { transform: 'translate(15px, 5px)' },
          '100%': { transform: 'translate(-15px, -5px)' },
        },
      },
    },
  },
  plugins: [],
};
