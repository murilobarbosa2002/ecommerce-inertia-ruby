# 0022 - Credentials do ambiente de teste comitadas, separadas das de produção

## Status

Aceito

## Contexto

O job `test`/`js` do CI decripta `config/credentials.yml.enc` em runtime via a variável `RAILS_MASTER_KEY` (secret do repositório, `docs/adr/0018`, bug documentado em `docs/bugs/infrastructure.md`) — `otp_secret` do 2FA (`docs/adr/0013`) usa Active Record Encryption, que exige isso mesmo em ambiente de teste, sem banco nenhum de verdade envolvido.

Isso funciona em push/PR normais, mas falha de forma sistemática em PRs abertos pelo Dependabot: o GitHub Actions não passa secrets do repositório pra workflows disparados por `pull_request` quando o autor é o Dependabot — restrição de segurança deliberada, pra impedir que um bump de dependência malicioso use o próprio CI pra exfiltrar um secret real. Resultado prático: todo PR do Dependabot que toque qualquer spec dependente de Active Record Encryption falha no job `test` com `ActiveRecord::Encryption::Errors::Configuration`, mesmo sendo um bump trivial sem nenhuma relação com criptografia — um falso vermelho recorrente, que treina a ignorar CI vermelho em vez de investigar.

A causa raiz não é falta do secret em si (ele existe, configurado desde `docs/bugs/infrastructure.md`) — é que o **ambiente de teste nunca deveria ter dependido de um segredo real pra existir**. `otp_secret` em teste é sempre dado descartável, gerado e destruído a cada execução; a chave que o decripta não protege nada sensível nesse contexto, só participa do boot do Active Record Encryption.

## Decisão

Credentials do Rails **por ambiente** (`bin/rails credentials:edit --environment test`), não um único `config/credentials.yml.enc` pra tudo:

- `config/credentials/test.yml.enc` guarda chaves de `active_record_encryption` geradas só pra teste (`bin/rails db:encryption:init`), sem nenhum valor reaproveitado de produção.
- `config/credentials/test.key` (a chave que decripta o arquivo acima) é **comitada** — exceção explícita em `.gitignore` (`!/config/credentials/test.key`, com comentário). Isso não contradiz a regra de "segredo nunca commitado" de `docs/adr/0010`: o que esse arquivo protege não é segredo — é dado de teste descartável, do mesmo jeito que uma senha de fixture (`AdminCredentials::VALID_PASSWORD`) já é comitada sem problema. Comitar a chave é o que torna o ambiente de teste autossuficiente, sem depender de infraestrutura de secret nenhuma pra existir.
- `config/credentials.yml.enc` + `config/master.key` continuam intocados, exclusivos de produção (fora do git, via `RAILS_MASTER_KEY`) — Rails já prefere automaticamente o arquivo do ambiente ativo (`config/credentials/#{Rails.env}.yml.enc`) quando ele existe, sem precisar de nenhuma configuração adicional de código.
- `.github/workflows/ci.yml`: `RAILS_MASTER_KEY: ${{ secrets.RAILS_MASTER_KEY }}` removido dos jobs `test` e `js` — não é mais necessário pra rodar a suíte nem gerar `app/frontend/routes.js` (`docs/adr/0018`), já que `RAILS_ENV=test` resolve as credentials certas sozinho.

Verificado localmente rodando a suíte completa (`bundle exec rspec`) e `bin/rails js:routes` com `RAILS_MASTER_KEY` explicitamente ausente do ambiente, reproduzindo a condição real de um PR do Dependabot.

## Consequências

- PR do Dependabot passa a rodar CI de verdade, sem falso vermelho — a prova real de que um bump de dependência não quebrou nada volta a valer.
- Qualquer execução sem acesso a secrets do repositório (fork de contribuidor externo, por exemplo) também passa a rodar a suíte de teste completa sem fricção — consequência mais ampla que só o caso do Dependabot.
- `docs/adr/0018`, na frase "precisa de `RAILS_MASTER_KEY` no ambiente" sobre o job `js`, descreve um estado que este ADR supera — não editado retroativamente (`docs/adr/0001`), só não é mais verdade a partir de agora.
- Se um dia o 2FA de teste precisar simular dado de produção de verdade (não é o caso hoje — todo `otp_secret` de teste é gerado e descartado), isso exigiria revisitar esta decisão, nunca reaproveitar a chave de produção em teste como atalho.
- Gerar uma nova chave de `active_record_encryption` pra teste (ex. se o arquivo for perdido) é só repetir `bin/rails db:encryption:init` + `bin/rails credentials:edit --environment test` — sem nenhuma coordenação com produção, já que são chaves completamente independentes.
