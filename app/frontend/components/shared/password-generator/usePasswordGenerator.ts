import { useState } from "react";

import generatePassword from "@/lib/generatePassword";

// bcrypt (has_secure_password) trunca em 72 bytes — acima disso o excesso é
// ignorado silenciosamente, então o máximo aqui evita gerar uma senha maior
// do que o que o backend de fato usa.
export const MIN_LENGTH = 8;
export const MAX_LENGTH = 72;
const DEFAULT_LENGTH = 20;

export default function usePasswordGenerator(
  onGenerate: (password: string) => void,
) {
  const [lengthInput, setLengthInput] = useState(String(DEFAULT_LENGTH));
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialCharacters, setIncludeSpecialCharacters] =
    useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const typedLength = Number(lengthInput);
    // input type="number" não bloqueia digitar fora de min/max nem string
    // vazia (NaN) — clampa só aqui (não a cada tecla, que corrompe digitar
    // um número de múltiplos dígitos: o primeiro dígito sozinho já fica fora
    // do intervalo e seria clampado antes do segundo dígito chegar).
    const length = Number.isNaN(typedLength)
      ? MIN_LENGTH
      : Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, typedLength));

    const password = generatePassword({
      length,
      includeUppercase,
      includeNumbers,
      includeSpecialCharacters,
    });
    setGeneratedPassword(password);
    setCopied(false);
    onGenerate(password);
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
    });
  };

  return {
    lengthInput,
    setLengthInput,
    includeUppercase,
    setIncludeUppercase,
    includeNumbers,
    setIncludeNumbers,
    includeSpecialCharacters,
    setIncludeSpecialCharacters,
    generatedPassword,
    copied,
    handleGenerate,
    handleCopy,
  };
}
