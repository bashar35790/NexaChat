import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger ring-1 ring-danger/20"
      >
        <AlertTriangle className="size-6" />
      </div>
      <p className="max-w-xs text-sm leading-relaxed text-muted">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
