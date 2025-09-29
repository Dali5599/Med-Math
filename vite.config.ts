
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ['react', 'react-router-dom'],
      dts: true,
    }),
  ],
  define: {
    __BASE_PATH__: JSON.stringify(process.env.NODE_ENV === 'production' ? './' : '/'),
  },
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          terminal: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'react-i18next',
      '@xterm/xterm',
      '@xterm/addon-fit',
      '@xterm/addon-web-links'
    ]
  }
})
