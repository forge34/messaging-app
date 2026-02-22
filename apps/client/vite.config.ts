import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  envDir:
    mode === "development"
      ? path.resolve(__dirname, "../../") 
      : undefined, 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
