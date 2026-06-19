import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuracion principal de Vite para compilar React con TypeScript.
export default defineConfig({
  plugins: [react()],
});
