import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginCliBrowserBridge from 'vite-plugin-cli-browser-bridge';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginCliBrowserBridge({
      port: 3333, // WebSocket server port (default: 3333)
      verbose: true, // Verbose console logs (default: false)
    }),
  ],
});
