# 0008 - Docker permitido para ferramentas auxiliares, fora do ambiente de dev da aplicação

## Status

Aceito

## Contexto

O `docs/adr/0005-native-wsl-dev-environment.md` decidiu que o ambiente de desenvolvimento **da aplicação** (Ruby, Node, PostgreSQL) é nativo no WSL, sem Docker. Separadamente, surgiu a necessidade de rodar o servidor MCP oficial do GitHub (`ghcr.io/github/github-mcp-server`), que é distribuído pela GitHub como imagem de container — não existe um binário nativo simples pra isso no momento.

Era preciso deixar explícito que usar Docker para rodar essa ferramenta auxiliar **não é** uma reversão do ADR 0005, para não gerar confusão ao reler as decisões depois.

## Decisão

Docker é permitido para rodar **ferramentas auxiliares de desenvolvimento** (ex. servidores MCP distribuídos como container) via a integração WSL do Docker Desktop, habilitada especificamente para esse fim. Isso é independente da decisão do ADR 0005: o ambiente de execução da aplicação (Rails, Vite, Postgres) continua nativo, sem Docker/docker-compose.

## Consequências

- Docker Desktop com integração WSL fica habilitado nesta máquina, mesmo o ADR 0005 dizendo "sem Docker" — a leitura correta é "sem Docker *para rodar a aplicação*", não "Docker proibido em qualquer contexto".
- Usuário precisa estar no grupo `docker` do WSL e ter uma sessão (terminal/Remote-WSL) aberta **depois** de entrar no grupo — sessões abertas antes de habilitar a integração não reconhecem a permissão até serem reiniciadas (`wsl --shutdown` no PowerShell + reabrir, ou reconectar o Remote-WSL).
- Qualquer necessidade futura de rodar algo via Docker deve ser avaliada por esse mesmo critério: é ferramenta auxiliar (ok) ou parte do ambiente de execução da aplicação (não, a menos que o ADR 0005 seja formalmente revisto)?
- Ver `docs/environment-setup.md` para o passo a passo de como a integração foi habilitada nesta máquina.
