import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(fileURLToPath(new URL('./src', import.meta.url))),
      "@shared": path.resolve(fileURLToPath(new URL('../shared', import.meta.url))),
      "@assets": path.resolve(fileURLToPath(new URL('../attached_assets', import.meta.url))),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});