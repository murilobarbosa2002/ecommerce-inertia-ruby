import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { ptBR } from "@/locales/pt-BR";

// Único locale do projeto é pt-BR (docs/adr/0014) — sem language detector
// nem backend de carregamento assíncrono, os recursos já vêm no bundle.
void i18n.use(initReactI18next).init({
  resources: { "pt-BR": { translation: ptBR } },
  lng: "pt-BR",
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false, // React já escapa por padrão.
  },
});

export default i18n;
