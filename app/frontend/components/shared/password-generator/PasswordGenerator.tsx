import { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";
import generatePassword from "@/lib/generatePassword";

import { type PasswordGeneratorProps } from "./PasswordGenerator.types";

// bcrypt (has_secure_password) trunca em 72 bytes — acima disso o excesso é
// ignorado silenciosamente, então o máximo aqui evita gerar uma senha maior
// do que o que o backend de fato usa.
const MIN_LENGTH = 8;
const MAX_LENGTH = 72;
const DEFAULT_LENGTH = 20;

export default function PasswordGenerator({
  onGenerate,
}: PasswordGeneratorProps) {
  const { t } = useTranslation();
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

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="password-generator-uppercase"
            checked={includeUppercase}
            onCheckedChange={(checked) => {
              setIncludeUppercase(checked === true);
            }}
          />
          <Label htmlFor="password-generator-uppercase" className="mb-0">
            {t("shared.passwordGenerator.includeUppercase")}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="password-generator-numbers"
            checked={includeNumbers}
            onCheckedChange={(checked) => {
              setIncludeNumbers(checked === true);
            }}
          />
          <Label htmlFor="password-generator-numbers" className="mb-0">
            {t("shared.passwordGenerator.includeNumbers")}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="password-generator-special-characters"
            checked={includeSpecialCharacters}
            onCheckedChange={(checked) => {
              setIncludeSpecialCharacters(checked === true);
            }}
          />
          <Label
            htmlFor="password-generator-special-characters"
            className="mb-0"
          >
            {t("shared.passwordGenerator.includeSpecialCharacters")}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="password-generator-length" className="mb-0">
            {t("shared.passwordGenerator.length")}
          </Label>
          <Input
            id="password-generator-length"
            type="number"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={lengthInput}
            onChange={(event) => {
              setLengthInput(event.target.value);
            }}
            className="w-20"
          />
        </div>
      </div>

      <Button
        type="button"
        intent="ghost"
        onClick={handleGenerate}
        className="mt-3"
      >
        {t("shared.passwordGenerator.generate")}
      </Button>

      {generatedPassword && (
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-sm bg-gray-100 px-3 py-2 text-sm break-all text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {generatedPassword}
          </code>
          <Button type="button" intent="ghost" onClick={handleCopy}>
            {copied
              ? t("shared.passwordGenerator.copied")
              : t("shared.passwordGenerator.copy")}
          </Button>
        </div>
      )}
    </div>
  );
}
