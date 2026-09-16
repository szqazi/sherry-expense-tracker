import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sherry-expense-tracker/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Sherry Expense Tracker',
        short_name: 'Expenses',
        description: 'Track expenses and income, entirely on your device.',
        theme_color: '#0b0b0f',
        background_color: '#0b0b0f',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Without this, the SPA navigation fallback below intercepts every
        // top-level navigation — including a click on a plain <a href> to a
        // static page like guide.pdf or demo-reel.html — and serves index.html
        // instead. The app itself has no real routes besides its root, so
        // excluding every non-root static page this way is safe.
        navigateFallbackDenylist: [/\.pdf$/, /\.html$/],
      },
    }),
  ],
}))
