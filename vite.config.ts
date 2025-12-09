
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  console.log('Vite mode:', mode);
  const env = loadEnv(mode, '.', '');
  return {
    base: mode === 'development' ? '/' : 'https://github.com/DerrickHodge/chp-website/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.BESTRX_USERNAME': JSON.stringify(env.BESTRX_USERNAME),
      'process.env.BESTRX_PASSWORD': JSON.stringify(env.BESTRX_PASSWORD),
      'process.env.BESTRX_PHARMACY_NUMBER': JSON.stringify(env.BESTRX_PHARMACY_NUMBER)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
