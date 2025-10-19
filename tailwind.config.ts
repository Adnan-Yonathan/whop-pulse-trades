import { frostedThemePlugin } from "@whop/react/tailwind";

export default {
  plugins: [frostedThemePlugin()],
  theme: {
    extend: {
      colors: {
        robinhood: {
          bg: '#0d0d0d',
          card: '#1a1a1a',
          green: '#00c805',
          red: '#ff5000',
          text: '#ffffff',
          muted: '#a0a0a0',
          border: '#2a2a2a',
          hover: '#1f1f1f',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        }
      }
    }
  }
};
