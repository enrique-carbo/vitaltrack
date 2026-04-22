// @ts-check
import path from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [
    react(),
    AstroPWA({
      strategies: "injectManifest",
      srcDir: "./src",
      filename: "service-worker.js",
      // Configuración para desarrollo
      devOptions: {
        enabled: true,
      },
      // Actualización automática
      registerType: "autoUpdate",
      // Workbox settings (Cache)
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
