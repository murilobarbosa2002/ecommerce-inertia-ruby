export interface GeneratePasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSpecialCharacters: boolean;
}

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SPECIAL_CHARACTERS = "!@#$%^&*()-_=+[]{}";

// crypto.getRandomValues (não Math.random, que não é seguro pra nada
// sensível — CONTRIBUTING.md, "Segurança") — minúsculas sempre presentes,
// pra nunca gerar com um pool vazio se todas as opções vierem desmarcadas.
export default function generatePassword({
  length,
  includeUppercase,
  includeNumbers,
  includeSpecialCharacters,
}: GeneratePasswordOptions): string {
  let characterPool = LOWERCASE;
  if (includeUppercase) characterPool += UPPERCASE;
  if (includeNumbers) characterPool += NUMBERS;
  if (includeSpecialCharacters) characterPool += SPECIAL_CHARACTERS;

  const randomValues = crypto.getRandomValues(new Uint32Array(length));

  return Array.from(
    randomValues,
    (value) => characterPool[value % characterPool.length],
  ).join("");
}
