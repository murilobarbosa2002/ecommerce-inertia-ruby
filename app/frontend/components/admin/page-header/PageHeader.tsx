import GradientBackdrop from "@/components/motion/GradientBackdrop";

import { type PageHeaderProps } from "./PageHeader.types";

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-card border border-line bg-surface p-8 shadow-card">
      <GradientBackdrop />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-prose text-sm text-fg-muted">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
