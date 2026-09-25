import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'iOS >= 9',
        'Safari >= 9',
        'Chrome >= 49'
      ],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime', 'whatwg-fetch']
    })
  ],
  server: {
    port: 3000,
    host: true
  }
});
