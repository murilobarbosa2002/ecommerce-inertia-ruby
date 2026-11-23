import { tv } from "tailwind-variants";

export const popoverContent = tv({
  // max-h: o conteúdo (calendário + horário) pode ficar mais alto que o
  // espaço entre o gatilho e a borda da viewport — sem isso, o popover
  // (position: fixed) simplesmente extrapolava o fim da tela sem nenhum
  // jeito de rolar até o resto do conteúdo. A rolagem em si (overflow-y)
  // vive no wrapper interno (popoverScrollArea), não aqui.
  base: "z-50 max-h-[min(32rem,85vh)] w-80 rounded-card border border-line bg-surface shadow-popover focus:outline-none",
});

export const popoverScrollArea = tv({
  // mr-1 mb-1: afasta a área rolável da borda arredondada do popover —
  // sem essa margem, overflow-y-auto desenha a barra de rolagem rente à
  // borda (ela vive na borda do próprio elemento com overflow, não
  // respeita o padding do conteúdo em volta dela).
  base: "themed-scrollbar mr-1 mb-1 max-h-[inherit] overflow-y-auto p-4 pr-3",
});
