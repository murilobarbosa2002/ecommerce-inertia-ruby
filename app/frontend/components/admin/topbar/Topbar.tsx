import Breadcrumbs from "@/components/admin/breadcrumbs/Breadcrumbs";

import { type TopbarProps } from "./Topbar.types";

export default function Topbar({
  breadcrumbs,
  leading,
  children,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      {leading}
      <div className="min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
