import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, '.', '');
  let tailwind;
  try {
    // Dynamically import Tailwind's Vite plugin if available
    const mod = await import('@tailwindcss/vite');
    tailwind = mod.default;
  } catch {
    tailwind = undefined;
  }
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      // Ensures the output directory is clean before each build
      emptyOutDir: true,
    },
    plugins: tailwind ? [react(), tailwind()] : [react()],
    define: {
      // Use Vite-prefixed env variable for build-time injection
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      // Expose Vite env for runtime imports if needed
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
