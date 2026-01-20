import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // We keep this for now if any client-side only libs need it, 
      // but the main Gemini calls are moving to server.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      host: '0.0.0.0', // Expose frontend to network
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000', // Use IPv4 loopback explicitly
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});