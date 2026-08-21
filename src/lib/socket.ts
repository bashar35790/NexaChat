"use client";

import type { Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api/client";

/** Socket.io lives at the HOST ROOT — /api is REST-only (API.md §5). */
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

/**
 * Lazily-created, token-keyed singleton. The client is imported dynamically so
 * SSR/prerender never touches browser-only code. Reconnecting as a different
 * identity swaps the underlying connection; same-token callers share it.
 */
let socketPromise: Promise<Socket> | null = null;
let currentToken: string | null = null;

let status: ConnectionStatus = "idle";
const statusListeners = new Set<(next: ConnectionStatus) => void>();

function setStatus(next: ConnectionStatus): void {
  if (status === next) return;
  status = next;
  for (const listener of [...statusListeners]) listener(next);
}

export function subscribeConnectionStatus(
  listener: (next: ConnectionStatus) => void,
): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function getConnectionStatus(): ConnectionStatus {
  return status;
}

function wireLifecycle(socket: Socket): Socket {
  socket.on("connect", () => setStatus("connected"));
  socket.on("disconnect", () => setStatus("disconnected"));
  // Handshake failures (bad/expired token) and network drops both land here;
  // engine.io keeps retrying until teardown or success.
  socket.on("connect_error", () => setStatus("connecting"));
  socket.io.on("reconnect_attempt", () => setStatus("connecting"));
  return socket;
}

export async function getSocket(token: string): Promise<Socket> {
  if (socketPromise && currentToken === token) return socketPromise;

  if (socketPromise) await disconnectSocket();

  currentToken = token;
  setStatus("connecting");
  socketPromise = import("socket.io-client").then(({ io }) =>
    wireLifecycle(
      io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
      }),
    ),
  );
  return socketPromise;
}

/** Idempotent full stop — safe to call from logout paths that may race. */
export async function disconnectSocket(): Promise<void> {
  const pending = socketPromise;
  socketPromise = null;
  currentToken = null;

  if (!pending) {
    setStatus("idle");
    return;
  }
  try {
    const socket = await pending;
    socket.removeAllListeners();
    socket.io.removeAllListeners();
    socket.disconnect();
  } finally {
    setStatus("idle");
  }
}
