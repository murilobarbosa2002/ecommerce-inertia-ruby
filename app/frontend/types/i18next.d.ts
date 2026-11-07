import { ptBR } from "@/locales/pt-BR";

// Dá ao TypeScript o shape literal dos recursos, validando toda chave de
// `t("...")` em compile-time.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof ptBR;
    };
  }
}
