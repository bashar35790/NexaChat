"use client";

import { useSyncExternalStore } from "react";
import {
  getConnectionStatus,
  hasConnectedOnce,
  subscribeConnectionStatus,
  type ConnectionStatus,
} from "@/lib/socket";

/**
 * Reactive view of the transport status. `reconnecting` is only true for
 * disruptions AFTER a successful handshake — the initial connect stays silent.
 */
export function useConnectionStatus(): {
  status: ConnectionStatus;
  reconnecting: boolean;
} {
  const status = useSyncExternalStore(
    subscribeConnectionStatus,
    getConnectionStatus,
    () => "idle" as const satisfies ConnectionStatus,
  );
  const everConnected = useSyncExternalStore(
    subscribeConnectionStatus,
    hasConnectedOnce,
    () => false,
  );

  const disrupted = status === "connecting" || status === "disconnected";
  return { status, reconnecting: disrupted && everConnected };
}
