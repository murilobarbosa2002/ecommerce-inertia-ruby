# 0005 - Ambiente de desenvolvimento nativo no WSL (sem Docker)

## Status

Aceito

## Contexto

O ambiente de desenvolvimento é um WSL (Ubuntu) recém-instalado, acessado via VS Code no Windows através da extensão Remote-WSL. Duas abordagens foram consideradas para rodar Ruby, Node e PostgreSQL localmente:

1. Docker Compose, com Rails/Postgres/Redis em containers — mais reprodutível para onboarding de terceiros, mas depende da integração WSL do Docker Desktop (disponível, porém não habilitada neste WSL).
2. Instalação nativa dentro do WSL (version manager para Ruby/Node, Postgres instalado diretamente via apt).

## Decisão

Ambiente de desenvolvimento local **nativo no WSL**: Ruby e Node gerenciados por [mise](https://mise.jdx.dev/) (versões pinadas em `mise.toml` versionado no repo), PostgreSQL instalado via apt e rodando como serviço systemd. Docker não é usado para desenvolvimento local.

## Consequências

- Setup inicial mais rápido e sem dependência do Docker Desktop, mas a reprodutibilidade de ambiente fica a cargo do `mise.toml` (versões de linguagem) em vez de uma imagem de container completa — diferenças de SO/libs do host WSL não são encapsuladas.
- Como o desenvolvimento acontece via VS Code + Remote-WSL, qualquer ferramenta de teste/debug (test explorers de extensões, por exemplo) precisa ser validada funcionando *através* dessa conexão remota, não só via terminal/CLI dentro do WSL.
- Se o projeto precisar futuramente de paridade forte entre dev/produção (ex. para CI ou deploy), isso pode justificar revisitar esta decisão com um novo ADR.
