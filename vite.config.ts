import react from "@vitejs/plugin-react";
import inertia from "@inertiajs/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import RubyPlugin from "vite-plugin-ruby";

export default defineConfig({
  plugins: [tailwindcss(), RubyPlugin(), inertia(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
  },
});
