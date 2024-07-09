import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression'; // Optional: for serving compressed assets
import { visualizer } from 'rollup-plugin-visualizer'; // Optional: for visualizing bundle size

export default defineConfig({
  plugins: [
    react(),
    viteCompression(), // Optional: for serving compressed assets
    visualizer({ // Optional: for visualizing bundle size
      filename: './dist/stats.html',
      open: true,
    }),
  ],
  server: {
    port: 3000,
    
  },
  build: {
    target: 'esnext', // Optimize for modern browsers
    outDir: 'dist', // Output directory
    assetsDir: 'assets', // Directory for static assets
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'], // Core React libraries
        },
      },
    },
    chunkSizeWarningLimit: 1500, // Increase the limit to suppress warnings
    minify: 'terser', // Use 'terser' for more aggressive minification
    sourcemap: false, // Disable source maps for production build
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle core libraries to speed up dev server
  },
  cacheDir: './node_modules/.vite', // Enable caching
});
