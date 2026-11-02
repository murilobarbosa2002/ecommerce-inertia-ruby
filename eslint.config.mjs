// @ts-check
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "public/**",
      "log/**",
      "tmp/**",
      "storage/**",
      "vendor/**",
      "db/**",
      ".kamal/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      jsxA11y.flatConfigs.strict,
      betterTailwindcss.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
      "better-tailwindcss": {
        entryPoint: "app/frontend/entrypoints/application.css",
      },
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      // Redundante com @typescript-eslint/no-unused-vars, que já cobre TS.
      "no-unused-vars": "off",
      // Formatação (ordem de classe, quebra de linha, espaço) é responsabilidade
      // do Prettier + prettier-plugin-tailwindcss, não do ESLint — evita os dois
      // ficarem brigando pelo mesmo template literal. Mantém as regras de
      // correção (classe desconhecida/conflitante/duplicada) ativas.
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-unnecessary-whitespace": "off",
    },
  },
  eslintConfigPrettier,
);
