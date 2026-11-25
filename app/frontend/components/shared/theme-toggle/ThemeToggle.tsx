import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import useTheme from "@/hooks/useTheme";

import { themeToggle } from "./ThemeToggle.variants";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? t("shared.themeToggle.switchToLight")
          : t("shared.themeToggle.switchToDark")
      }
      className={themeToggle()}
    >
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
