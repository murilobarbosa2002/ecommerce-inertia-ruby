import { type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Toast as RadixToast } from "radix-ui";
import { useTranslation } from "react-i18next";

import SlideFade from "@/components/motion/SlideFade";
import CheckCircleIcon from "@/components/shared/icons/check-circle-icon/CheckCircleIcon";
import ExclamationIcon from "@/components/shared/icons/exclamation-icon/ExclamationIcon";

import { type ToastProps } from "./Toast.types";
import { toast } from "./Toast.variants";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <RadixToast.Provider swipeDirection="right">
      {children}
      <RadixToast.Viewport className="fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none" />
    </RadixToast.Provider>
  );
}

export default function Toast({
  open,
  onOpenChange,
  tone,
  children,
}: ToastProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <RadixToast.Root
          asChild
          forceMount
          open={open}
          onOpenChange={onOpenChange}
        >
          <SlideFade
            direction="right"
            duration={0.2}
            role={tone === "notice" ? "status" : "alert"}
            className={toast({ tone })}
          >
            {tone === "notice" ? <CheckCircleIcon /> : <ExclamationIcon />}
            <RadixToast.Description className="flex-1">
              {children}
            </RadixToast.Description>
            <RadixToast.Close
              aria-label={t("shared.toast.close")}
              className="text-fg-subtle hover:text-fg"
            >
              <X className="size-4" aria-hidden="true" />
            </RadixToast.Close>
          </SlideFade>
        </RadixToast.Root>
      )}
    </AnimatePresence>
  );
}
