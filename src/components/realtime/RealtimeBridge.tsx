"use client";

import { useEffect } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthStore } from "@/stores/authStore";

/**
 * Transport lifecycle for the authenticated tree: opens the socket ONLY after
 * the persisted token has been validated by /auth/me (plan §7), swaps
 * connections if the identity changes, and tears it down on unmount/logout.
 * Event wiring lands with the cache integration; this component owns the pipe.
 */
export function RealtimeBridge() {
  const session = useAuthSession();
  const token = useAuthStore((s) => s.token);

  const connected = session === "authenticated" && Boolean(token);

  useEffect(() => {
    if (!connected || !token) return;
    void getSocket(token).catch(() => {
      // Handshake failures surface via connection status; nothing to do here.
    });
    return () => {
      void disconnectSocket();
    };
  }, [connected, token]);

  return null;
}
