# 0001 - Registrar decisões de arquitetura em ADRs

## Status

Aceito

## Contexto

Este projeto é um template open source e white-label de e-commerce, sob licença MIT, que qualquer pessoa pode adotar e adaptar para seu próprio negócio/nicho (ver `README.md`). Decisões de arquitetura tomadas agora vão impactar diretamente o custo de adaptar o código para cada novo nicho no futuro. Além disso, o histórico de conversa com ferramentas de IA (como o Claude Code) é resumido/compactado com o tempo, e decisões discutidas apenas em chat tendem a se perder.

## Decisão

Toda decisão arquitetural relevante — e, mais importante, o *porquê* dela — é registrada como um Architecture Decision Record (ADR) em `docs/adr/`, seguindo o formato leve popularizado por Michael Nygard: Status, Contexto, Decisão, Consequências. ADRs são numerados sequencialmente e nunca editados retroativamente para mudar a decisão original — uma mudança de direção vira um novo ADR que referencia o anterior.

## Consequências

- Decisões sobrevivem a compactação de contexto, troca de sessão ou de pessoa trabalhando no projeto.
- O racional por trás de uma escolha (não só a escolha em si) fica explícito, o que ajuda a avaliar se ela ainda se aplica quando o contexto mudar (ex. um novo nicho com requisito diferente).
- Exige disciplina de escrever o ADR no momento da decisão, não depois.
