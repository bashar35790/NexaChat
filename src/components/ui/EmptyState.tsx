import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-2xl bg-raised text-faint ring-1 ring-line [&>svg]:size-6"
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h3>
        {description ? (
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
