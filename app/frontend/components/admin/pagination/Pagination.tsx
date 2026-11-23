import { useTranslation } from "react-i18next";

import Button from "@/components/shared/button/Button";

import { type PaginationProps } from "./Pagination.types";

export default function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  disabled = false,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <Button
        type="button"
        intent="outline"
        size="sm"
        onClick={onPrevious}
        disabled={disabled || page <= 1}
      >
        {t("shared.pagination.previous")}
      </Button>
      <p className="text-xs text-fg-subtle">
        {t("shared.pagination.pageOf", { page, totalPages })}
      </p>
      <Button
        type="button"
        intent="outline"
        size="sm"
        onClick={onNext}
        disabled={disabled || page >= totalPages}
      >
        {t("shared.pagination.next")}
      </Button>
    </div>
  );
}
