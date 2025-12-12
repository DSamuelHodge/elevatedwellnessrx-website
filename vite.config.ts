
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  console.log('Vite mode:', mode);
  const env = loadEnv(mode, '.', '');
  return {
    base: mode === 'development' ? '/' : 'https://dsamuelhodge.github.io/elevatedwellnessrx-website/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
      'process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.BESTRX_API_KEY': JSON.stringify(env.BESTRX_API_KEY),
      'process.env.BESTRX_USERNAME': JSON.stringify(env.BESTRX_USERNAME),
      'process.env.BESTRX_PASSWORD': JSON.stringify(env.BESTRX_PASSWORD),
      'process.env.BESTRX_PHARMACY_NUMBER': JSON.stringify(env.BESTRX_PHARMACY_NUMBER)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
