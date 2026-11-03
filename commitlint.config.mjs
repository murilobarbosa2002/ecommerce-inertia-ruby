export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Corpo do commit é sempre em português, detalhado, com parágrafos longos
    // (exigido por CLAUDE.md) — não faz sentido limitar largura de linha.
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
