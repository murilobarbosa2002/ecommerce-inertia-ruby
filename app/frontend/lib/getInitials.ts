const SEPARATORS = /[\s._-]+/;

// Iniciais pra o fallback de um avatar. Aceita nome ("Ana Souza" → "AS") ou
// e-mail ("ana.souza@loja.com" → "AS", ignora o domínio). Uma palavra só dá
// as duas primeiras letras ("admin" → "AD"). Vazio dá "?".
export default function getInitials(source: string): string {
  const [localPart] = source.trim().split("@");
  const words = localPart.split(SEPARATORS).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
