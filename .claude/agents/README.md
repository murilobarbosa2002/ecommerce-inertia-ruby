# Agentes do projeto

Esta pasta guarda agentes especializados (`.claude/agents/*.md`) para workflows recorrentes e específicos deste projeto.

- **`docs-writer.md`** — mantém a documentação do projeto (`README.md`, `CONTRIBUTING.md`, `docs/adr/`, etc.) consistente com as convenções já estabelecidas.

Novos agentes não são criados antecipadamente "por si". Um agente entra aqui quando já existe um workflow repetitivo real no projeto que vale a pena encapsular — a definição de cada agente deve referenciar as decisões registradas em `docs/adr/` e em `CONTRIBUTING.md`, não reinventar convenções.

**Nome do arquivo sempre em inglês** (`.claude/agents/<nome-em-ingles>.md`), mesmo o conteúdo sendo em português — mesma regra do resto do projeto (ver `CLAUDE.md`).
