"use client";

import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Floating "Reconnecting…" indicator shown whenever the realtime transport
 * drops or is retrying after a previously-successful connection. Gap healing
 * (cache invalidation on reconnect) lives in RealtimeBridge.
 */
export function ConnectionBanner() {
  const { reconnecting } = useConnectionStatus();
  if (!reconnecting) return null;

  return (
    <div
      role="alert"
      className="fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-surface/95 py-1.5 pl-3 pr-4 text-xs font-medium text-muted shadow-lg ring-1 ring-line backdrop-blur"
    >
      <Spinner size="sm" label="" className="text-accent" />
      Reconnecting…
    </div>
  );
}
