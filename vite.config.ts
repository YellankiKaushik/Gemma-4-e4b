import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            input: {
                sidepanel: path.resolve(__dirname, "sidepanel.html"),
                "service-worker": path.resolve(__dirname, "src/extension/service-worker.ts"),
            },
            output: {
                entryFileNames: (chunk) =>
                    chunk.name === "service-worker"
                        ? "service-worker.js"
                        : "assets/[name]-[hash].js",
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
    },
});
