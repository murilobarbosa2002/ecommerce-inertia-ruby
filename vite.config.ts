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
    // Por padrão o Vitest devolve string vazia pra qualquer .css (inclusive
    // com ?raw). tokens.test.ts precisa do texto real pra validar o contraste.
    css: { include: [/styles\/tokens\.css/] },
  },
});
