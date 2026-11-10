import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import { type PasswordGeneratorProps } from "./PasswordGenerator.types";
import usePasswordGenerator, {
  MAX_LENGTH,
  MIN_LENGTH,
} from "./usePasswordGenerator";

export default function PasswordGenerator({
  onGenerate,
}: PasswordGeneratorProps) {
  const { t } = useTranslation();
  const {
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
  } = usePasswordGenerator(onGenerate);

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-gray-700 select-none dark:text-gray-300">
          {t("shared.passwordGenerator.optionsLabel")}
        </legend>
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
      </fieldset>

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
