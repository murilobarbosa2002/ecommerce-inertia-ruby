import { useState } from "react";
import { router } from "@inertiajs/react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/admin/pagination/Pagination";
import Button from "@/components/shared/button/Button";
import Card from "@/components/shared/card/Card";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import Dialog from "@/components/shared/dialog/Dialog";
import EmptyState from "@/components/shared/empty-state/EmptyState";
import Label from "@/components/shared/label/Label";
import Link from "@/components/shared/link/Link";
import quickActionsCatalog from "@/config/quickActions";
import filterQuickActions from "@/lib/quick-actions/filterQuickActions";
import { admin_quick_actions_path } from "@/routes";

import { type QuickActionsProps } from "./QuickActions.types";

const PAGE_SIZE = 5;

export default function QuickActions({
  permissions,
  quickActionKeys,
  className,
}: QuickActionsProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);

  const allowed = filterQuickActions(quickActionsCatalog, permissions);
  const effectiveKeys =
    quickActionKeys.length > 0 ? quickActionKeys : allowed.map((a) => a.key);
  const visible = allowed.filter((action) =>
    effectiveKeys.includes(action.key),
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visible.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const [selectedKeys, setSelectedKeys] = useState<string[]>(effectiveKeys);

  const openDialog = () => {
    setSelectedKeys(effectiveKeys);
    setDialogOpen(true);
  };

  const save = () => {
    setIsSaving(true);
    router.patch(
      admin_quick_actions_path(),
      { quick_action_keys: selectedKeys },
      {
        onFinish: () => {
          setIsSaving(false);
          setDialogOpen(false);
        },
      },
    );
  };

  return (
    <Card className={className}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">
          {t("admin.dashboard.show.quickActions.title")}
        </h2>
        {allowed.length > 0 && (
          <Button
            type="button"
            intent="ghost"
            size="icon"
            aria-label={t("admin.dashboard.show.quickActions.configure")}
            onClick={openDialog}
          >
            <Settings className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          titleAs="h3"
          title={t("admin.dashboard.show.quickActions.emptyTitle")}
          description={t("admin.dashboard.show.quickActions.emptyDescription")}
        />
      ) : (
        <ul className="space-y-1">
          {pageItems.map((action) => (
            <li key={action.key}>
              <Link
                href={action.href()}
                className="-mx-2 flex items-center gap-3 rounded-control p-2 text-sm font-medium text-fg hover:bg-surface-muted"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                  <action.icon className="size-4" aria-hidden="true" />
                </div>
                {t(action.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPrevious={() => {
          setPage(safePage - 1);
        }}
        onNext={() => {
          setPage(safePage + 1);
        }}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("admin.dashboard.show.quickActions.dialogTitle")}
        description={t("admin.dashboard.show.quickActions.dialogDescription")}
      >
        <fieldset className="space-y-2">
          {allowed.map((action) => (
            <div key={action.key} className="flex items-center gap-2">
              <Checkbox
                id={`quick-action-${action.key}`}
                checked={selectedKeys.includes(action.key)}
                onCheckedChange={(checked) => {
                  setSelectedKeys((current) =>
                    checked === true
                      ? [...current, action.key]
                      : current.filter((key) => key !== action.key),
                  );
                }}
              />
              <Label htmlFor={`quick-action-${action.key}`} className="mb-0">
                {t(action.labelKey)}
              </Label>
            </div>
          ))}
        </fieldset>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            intent="ghost"
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            {t("admin.dashboard.show.quickActions.cancel")}
          </Button>
          <Button type="button" onClick={save} disabled={isSaving}>
            {isSaving
              ? t("admin.dashboard.show.quickActions.saving")
              : t("admin.dashboard.show.quickActions.save")}
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
