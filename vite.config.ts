import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@enums": path.resolve(__dirname, "src/enums"),
      "@scenes": path.resolve(__dirname, "src/scenes"),
      "@globalUtils": path.resolve(__dirname, "src/globalUtils"),
      "@workers": path.resolve(__dirname, "src/workers"),
    },
  },
});