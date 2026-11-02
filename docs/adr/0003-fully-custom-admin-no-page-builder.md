# 0003 - Admin/CMS 100% codado, sem gem de scaffolding e sem page builder

## Status

Aceito

## Contexto

O painel de administração precisa gerenciar produtos, pedidos, SEO, estatísticas e configuração de quais páginas existem para a loja (landing page, hot page, institucional). Duas alternativas foram consideradas para acelerar o desenvolvimento do admin:

1. Usar uma gem de scaffolding de admin (Avo, Administrate, etc.) para os CRUDs padrão, codando à mão só as partes específicas de CMS/SEO/estatísticas.
2. Construir 100% das telas do admin como código próprio (React + Inertia), sem nenhuma gem de scaffolding.

Também foi considerado se o CMS deveria permitir montar páginas via drag-and-drop (page builder visual).

## Decisão

O admin é **100% código próprio** (React + Inertia), sem gem de scaffolding. As páginas da loja (landing page, hot page, institucional, etc.) são sempre **codadas** (Ruby/React); o painel de CMS controla apenas *quais* dessas páginas codadas estão ativas e seu conteúdo/configuração — nunca oferece um construtor visual de páginas.

## Consequências

- Mais trabalho inicial de desenvolvimento do que usar uma gem de scaffolding, mas controle total sobre UX, consistência visual e comportamento — quem adotar o template herda um admin coerente, sem as limitações de uma gem genérica.
- Sem risco de os clientes finais (lojistas) quebrarem o layout da loja montando páginas livremente — toda página nova é um trabalho de desenvolvimento, não uma tarefa de usuário final. Isso é uma escolha de produto deliberada, não uma limitação técnica.
- Ao adaptar o template para um novo nicho, criar uma nova variação de página (ex. um tipo de landing page diferente) é trabalho de código, documentado e testado — não configuração ad-hoc.
