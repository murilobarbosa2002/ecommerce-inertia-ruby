import { useTranslation } from "react-i18next";

import MoonIcon from "@/components/shared/icons/moon-icon/MoonIcon";
import SunIcon from "@/components/shared/icons/sun-icon/SunIcon";
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
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
