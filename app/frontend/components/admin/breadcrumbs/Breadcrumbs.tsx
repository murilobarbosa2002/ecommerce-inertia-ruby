import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { type BreadcrumbsProps } from "./Breadcrumbs.types";

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("shared.panelLayout.breadcrumbs")} className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${String(index)}-${item}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  className="size-4 shrink-0 text-fg-subtle"
                  aria-hidden="true"
                />
              )}
              <span
                aria-current={isCurrent ? "page" : undefined}
                className={
                  isCurrent
                    ? "truncate font-semibold text-fg"
                    : "truncate text-fg-muted"
                }
              >
                {item}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
