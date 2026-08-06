/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
  build: {
    chunkSizeWarningLimit: 1000, // Set limit to 1000 kBs (default is 500)
  },
  publicDir: 'public',
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    css: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  server: {
    // Open the default browser with the dev server URL. Tooling that manages
    // the server itself (and brings its own preview) sets PORT — in that case
    // a popping system browser would only get in the way.
    open: !process.env.PORT, // or 'string' to open a specific path
    // host: true,          // helpful in WSL/Docker to expose to network
    // Fixed default port; tooling may assign a free one via PORT.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
