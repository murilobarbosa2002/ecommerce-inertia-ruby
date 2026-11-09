const PADDING = 32;
const TITLE_HEIGHT = 40;
const ROW_HEIGHT = 36;
const COLUMN_WIDTH = 260;
const COLUMNS = 2;

// Fundo branco/texto preto fixo (não segue o tema claro/escuro da UI) —
// é um arquivo pra guardar/imprimir, precisa ser legível em qualquer
// contexto, não só na tela onde foi gerado.
export default function downloadRecoveryCodesImage(
  codes: string[],
  title: string,
  filename: string,
) {
  const rows = Math.ceil(codes.length / COLUMNS);
  const canvas = document.createElement("canvas");
  canvas.width = PADDING * 2 + COLUMN_WIDTH * COLUMNS;
  canvas.height = PADDING * 2 + TITLE_HEIGHT + ROW_HEIGHT * rows;

  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#111827";
  context.font = "bold 20px monospace";
  context.fillText(title, PADDING, PADDING + 20);

  context.font = "18px monospace";
  codes.forEach((code, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x = PADDING + column * COLUMN_WIDTH;
    const y = PADDING + TITLE_HEIGHT + row * ROW_HEIGHT + 20;
    context.fillText(code, x, y);
  });

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  });
}
