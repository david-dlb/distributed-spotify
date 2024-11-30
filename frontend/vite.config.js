// @ts-check
import reactPlugin from 'vite-plugin-react';

/**
 */
const config = {
  plugins: [reactPlugin],
  server: {
    hmr: false,
    liveReload: false,
    watch: {
      usePolling: false,
    },
  },
  jsx: 'react',
};

export default config;
