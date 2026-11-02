# 0009 - pnpm como gerenciador de pacotes Node

## Status

Aceito

## Contexto

O gerador do `inertia_rails`/`vite_rails` (`rails generate inertia:install`) usa `npm` por padrão para instalar as dependências JS do projeto. O mantenedor pediu explicitamente para usar **pnpm** em vez de npm em todo o projeto, quando possível.

## Decisão

**pnpm é o gerenciador de pacotes Node oficial deste projeto**, não npm. Depois de gerar o scaffold com o instalador padrão do Inertia Rails (que cria `package-lock.json` via npm), os artefatos de npm são removidos e substituídos:

```bash
rm -rf node_modules package-lock.json
pnpm install
```

`package.json` fixa a versão exata via campo `packageManager` (`pnpm@12.16.1`), consistente com a versão pinada em `mise.toml`.

TypeScript sob pnpm tem uma particularidade: o isolamento estrito de `node_modules` do pnpm (pacotes ficam aninhados em `.pnpm/`, não soltos em `node_modules/<pacote>`) impede a resolução de `@inertiajs/core` pela checagem de tipos. Corrigido com `.npmrc`:

```ini
public-hoist-pattern[]=@inertiajs/core
```

## Consequências

- Todo comando documentado em `README.md`/`CONTRIBUTING.md`/`docs/environment-setup.md` usa `pnpm`/`pnpm dlx`, nunca `npm`/`npx`.
- Instalações mais rápidas e `node_modules` mais rigoroso (menos risco de dependência fantasma não declarada em `package.json`) — trade-off aceito: pode exigir ajustes como o do `.npmrc` acima quando uma lib assume a estrutura "flat" do npm.
- Qualquer novo gerador/scaffold do lado Ruby que assuma npm (ex. outros generators do `vite_rails`) precisa do mesmo ajuste pós-geração: remover artefatos de npm, rodar `pnpm install`, revisar scripts (`bin/setup`, CI) que chamem `npm`/`npx` diretamente.
- MCP servers que rodam pacotes Node via `npx` (Playwright, Chrome DevTools) são configurados com `pnpm dlx` no `.mcp.json`, não `npx`.
