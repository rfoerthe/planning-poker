/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react';
import packageJson from './package.json' with { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
  build: {
    chunkSizeWarningLimit: 1000, // Set limit to 1000 kBs (default is 500)
    rolldownOptions: {
      output: {
        /*
         * Keep the big third-party libraries in their own chunks. They change
         * only when a dependency is bumped, so browsers can reuse them across
         * releases instead of re-downloading them with every app change — and
         * a route that never touches Firestore never fetches it.
         *
         * Higher priority wins, so the specific groups are matched before the
         * catch-all `vendor` group.
         */
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/]@?firebase/, priority: 30 },
            { name: 'mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/, priority: 20 },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
              priority: 10,
            },
            { name: 'vendor', test: /node_modules/, priority: 1 },
          ],
        },
      },
    },
  },
  publicDir: 'public',
  test: {
    // Only pick up tests from src. Git worktrees live under .claude/worktrees
    // and would otherwise be collected too, running foreign branches' tests
    // against this checkout's config.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
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
