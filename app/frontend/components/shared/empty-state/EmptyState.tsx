import { type EmptyStateProps } from "./EmptyState.types";
import { emptyState } from "./EmptyState.variants";

export default function EmptyState({
  title,
  description,
  icon: Icon,
  titleAs: Title = "h3",
  children,
  className,
}: EmptyStateProps) {
  const slots = emptyState();

  return (
    <div className={slots.root({ className })}>
      {Icon && (
        <div className={slots.iconWrapper()}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <Title className={slots.title()}>{title}</Title>
      {description && <p className={slots.description()}>{description}</p>}
      {children && <div className={slots.actions()}>{children}</div>}
    </div>
  );
}
