import { ptBR } from "@/locales/pt-BR";

// Dá ao TypeScript o shape literal dos recursos de tradução, exigido pelo
// `t($ => $.chave.aninhada)` type-safe do react-i18next >= 17 (sem isso, `t`
// aceita qualquer seletor como `any`, violando a proibição de `any` do
// projeto).
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof ptBR;
    };
  }
}
