import Card from "@/components/shared/card/Card";

import { type StatCardProps } from "./StatCard.types";

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-fg">{value}</p>
        <p className="text-sm text-fg-muted">{label}</p>
      </div>
    </Card>
  );
}
