import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Configuracion principal de Vite para compilar React con TypeScript.
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Conserva Anime.js como recurso diferido identificable. La seccion
        // del asistente lo solicita solo cuando entra en el viewport.
        manualChunks(id) {
          if (id.includes("node_modules/animejs")) return "anime";
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        "favicon.svg",
        "pwa-192.png",
        "pwa-512.png",
        "pwa-maskable-512.png",
        "globe/earth-dark.jpg",
      ],
      manifest: {
        background_color: "#050c12",
        description:
          "Clima visual en tiempo real con explorador mundial y recomendaciones inteligentes.",
        display: "standalone",
        icons: [
          {
            sizes: "192x192",
            src: "/pwa-192.png",
            type: "image/png",
          },
          {
            sizes: "512x512",
            src: "/pwa-512.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "/pwa-maskable-512.png",
            type: "image/png",
          },
        ],
        lang: "es-MX",
        name: "AppWeb Clima",
        orientation: "any",
        scope: "/",
        short_name: "AppWeb Clima",
        start_url: "/",
        theme_color: "#071521",
      },
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        globIgnores: ["**/Globe3D-*.js"],
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
});
