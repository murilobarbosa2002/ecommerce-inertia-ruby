// Celular já vem normalizado como só dígitos do backend (Admin#phone,
// Admin::PHONE_FORMAT) — formata pra exibição (DDD + 9 dígitos).
export default function formatPhone(phone: string | null): string {
  if (!phone) return "—";

  const ddd = phone.slice(0, 2);
  const firstPart = phone.slice(2, 7);
  const secondPart = phone.slice(7);
  return `(${ddd}) ${firstPart}-${secondPart}`;
}
