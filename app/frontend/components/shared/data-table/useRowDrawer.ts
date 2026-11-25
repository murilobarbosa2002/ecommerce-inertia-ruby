import { useState } from "react";

// Estado de qual linha tem o Drawer de detalhe aberto (DataTable, mobile) —
// guarda a chave, não a linha em si, pra sobreviver a um reload que troca a
// identidade dos objetos de rows sem fechar o Drawer à toa (docs/adr/0029).
export default function useRowDrawer<Row>(
  rows: Row[],
  getRowKey: (row: Row) => string | number,
) {
  const [openRowKey, setOpenRowKey] = useState<string | number | null>(null);

  const openRow = rows.find((row) => getRowKey(row) === openRowKey) ?? null;

  const openDrawer = (row: Row) => {
    setOpenRowKey(getRowKey(row));
  };

  const closeDrawer = () => {
    setOpenRowKey(null);
  };

  return { openRow, openDrawer, closeDrawer };
}
