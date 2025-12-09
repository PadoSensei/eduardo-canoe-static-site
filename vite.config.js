import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        book: resolve(__dirname, "book.html"),
        faq: resolve(__dirname, "faq.html"),
        tours: resolve(__dirname, "tours.html"),
      },
    },
  },
});
