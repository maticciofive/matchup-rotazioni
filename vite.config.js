import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inline-css',
      enforce: 'post',
      applyToEnvironment(environment) {
        return environment.name === 'client';
      },
      async generateBundle(_, bundle) {
        // Trova il file HTML
        const htmlFile = Object.keys(bundle).find(file => file.endsWith('.html'));
        if (!htmlFile) return;

        // Trova il file CSS
        const cssFile = Object.keys(bundle).find(file => file.endsWith('.css'));
        if (!cssFile) return;

        // Leggi il contenuto CSS
        const cssContent = bundle[cssFile];
        if (!cssContent || cssContent.type !== 'asset') return;

        // Modifica l'HTML per includere il CSS inline
        const htmlAsset = bundle[htmlFile];
        if (htmlAsset.type !== 'asset' || typeof htmlAsset.source !== 'string') return;

        // Rimuovi il link al CSS esterno e inseriscilo inline
        let htmlContent = htmlAsset.source;
        htmlContent = htmlContent.replace(
          /<link rel="stylesheet"[^>]*>/,
          `<style>${cssContent.source}</style>`
        );

        // Aggiorna il bundle
        bundle[htmlFile] = {
          ...htmlAsset,
          source: htmlContent
        };

        // Rimuovi il file CSS esterno
        delete bundle[cssFile];
      }
    }
  ],
  base: '/matchup-rotazioni/',
  build: {
    cssCodeSplit: false,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
