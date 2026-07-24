import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    // NOTE: Do NOT add GEMINI_API_KEY or any server-side secrets here.
    // Vite `define` performs literal text substitution at build time —
    // anything here ends up in the publicly downloadable JS bundle.
    // Use import.meta.env.VITE_* for public Vite env vars only.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://localhost:53638',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[Vite Proxy] Forwarding ${req.method} ${req.url} -> ${options.target}`);
            });
            proxy.on('error', (err, req, res) => {
              console.error(`[Vite Proxy Error] Failed to connect to ${options.target} for ${req.url}:`, err.message);
            });
          }
        },
        '/uploads': {
          target: env.VITE_API_URL || 'https://localhost:53638',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[Vite Proxy] Forwarding static file request ${req.url} -> ${options.target}`);
            });
          }
        }
      }
    },
  };
});
