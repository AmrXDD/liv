import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        target: "es2022",
        sourcemap: false,
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom", "react-router-dom"],
                    motion: ["gsap", "framer-motion", "lenis"],
                    data: ["@tanstack/react-query", "@supabase/supabase-js"],
                    i18n: ["i18next", "react-i18next", "i18next-browser-languagedetector"],
                },
            },
        },
    },
    server: {
        port: 5173,
        host: true,
    },
});
