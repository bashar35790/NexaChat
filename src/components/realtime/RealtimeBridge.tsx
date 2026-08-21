"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "@/lib/socket";
import {
  applyConversationUpdate,
  applyIncomingMessage,
} from "@/lib/realtime/incoming";
import { queryKeys } from "@/lib/api/queryKeys";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthStore } from "@/stores/authStore";
import type {
  ConversationUpdatedPayload,
  RawSocketMessage,
} from "@/types/api";

/**
 * Transport lifecycle + event wiring for the authenticated tree: opens the
 * socket ONLY after the persisted token has been validated by /auth/me
 * (plan §7), swaps connections if the identity changes, and tears it down on
 * unmount/logout. `message:new` flows into the TanStack Query caches; an
 * sr-only live region announces arrivals for assistive tech.
 */
export function RealtimeBridge() {
  const queryClient = useQueryClient();
  const session = useAuthSession();
  const token = useAuthStore((s) => s.token);
  const [announcement, setAnnouncement] = useState("");

  const connected = session === "authenticated" && Boolean(token);

  useEffect(() => {
    if (!connected || !token) return;

    let active = true;
    let socket: Socket | null = null;
    /** Set when the transport drops; the next `connect` heals the gap. */
    let dropped = false;

    void getSocket(token)
      .then((instance) => {
        if (!active) return;
        socket = instance;

        const onConnect = () => {
          if (!dropped) return;
          dropped = false;
          // Gap healing: anything missed while offline is re-fetched. Prefix
          // keys hit every conversation's messages cache + the list itself.
          void queryClient.invalidateQueries({
            queryKey: queryKeys.messagesRoot(),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.conversations(),
          });
        };
        const onDisconnect = () => {
          dropped = true;
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message:new", (raw: RawSocketMessage) => {
          // Malformed/garbage events must never poison caches.
          if (
            !raw ||
            typeof raw.id !== "string" ||
            typeof raw.conversation !== "string" ||
            typeof raw.sender !== "string" ||
            typeof raw.text !== "string" ||
            typeof raw.createdAt !== "number"
          ) {
            return;
          }
          const { announcement: next } = applyIncomingMessage(
            queryClient,
            raw,
          );
          setAnnouncement(next);
        });
        socket.on(
          "conversation:updated",
          (raw: ConversationUpdatedPayload) => {
            if (
              !raw ||
              typeof raw._id !== "string" ||
              typeof raw.type !== "string"
            ) {
              return;
            }
            applyConversationUpdate(queryClient, raw);
          },
        );
      })
      .catch(() => {
        // Handshake failures surface via connection status; nothing to do here.
      });

    return () => {
      active = false;
      socket?.off("message:new");
      void disconnectSocket();
    };
  }, [connected, token, queryClient]);

  return (
    <div aria-live="polite" role="status" className="sr-only">
      {announcement}
    </div>
  );
}
