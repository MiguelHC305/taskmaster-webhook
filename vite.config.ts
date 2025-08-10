import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal"; // Comenta temporalmente

function getPlugins() {
  const plugins = [react()];
  // const plugins = [react(), runtimeErrorOverlay()]; // Comenta temporalmente

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    // Importa sin await, agrega después de la configuración (quizás no ideal, pero evita error)
    import("@replit/vite-plugin-cartographer").then((m) => {
      plugins.push(m.cartographer());
    });
  }
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
