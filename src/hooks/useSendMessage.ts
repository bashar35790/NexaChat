"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/lib/api/messages";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  bumpConversationPreview,
  removeMessage,
  replaceEverywhere,
  upsertMessage,
  type MessagesCache,
} from "@/lib/api/messageCache";
import { useAuthStore } from "@/stores/authStore";
import type { ClientMessage, Conversation } from "@/types/api";

export interface SendPayload {
  text: string;
  /** When retrying a failed bubble, its temp id is replaced by the new try. */
  failedTempId?: string;
}

function makeTempId(): string {
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Optimistic send pipeline (plan §3 contract):
 * temp-id pending bubble → replaced by the server entity on success → marked
 * failed (with retry) on error. The API answers HTTP 200 + body `null` for
 * nonexistent conversations; the endpoint module normalizes that into a thrown
 * ApiError so this onError path catches silent failures too (ISSUES.md #9).
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const meId = useAuthStore((s) => s.user?._id);
  const cacheKey = queryKeys.messages(conversationId);

  return useMutation({
    mutationFn: (payload: SendPayload) =>
      sendMessage({ conversationId, text: payload.text }),

    onMutate: async (payload) => {
      // Don't let an in-flight history refetch clobber the optimistic write.
      await queryClient.cancelQueries({ queryKey: cacheKey });

      const temp: ClientMessage = {
        _id: makeTempId(),
        conversation: conversationId,
        sender: meId ?? "",
        text: payload.text,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      queryClient.setQueryData<MessagesCache>(cacheKey, (old) => {
        const base = payload.failedTempId && old
          ? removeMessage(old, payload.failedTempId)
          : old;
        if (!base) {
          return upsertMessage(
            { pages: [], pageParams: [] },
            temp,
          );
        }
        return upsertMessage(base, temp);
      });

      return { tempId: temp._id };
    },

    onSuccess: (serverMessage, _payload, context) => {
      // Swap temp for the confirmed server entity (id becomes authoritative).
      queryClient.setQueryData<MessagesCache>(cacheKey, (old) =>
        old
          ? replaceEverywhere(old, context.tempId, () => ({ ...serverMessage }))
          : old,
      );

      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations(),
        (old) =>
          old ? bumpConversationPreview(old, conversationId, serverMessage) : old,
      );
    },

    onError: (_error, _payload, context) => {
      if (!context) return;
      queryClient.setQueryData<MessagesCache>(cacheKey, (old) =>
        old
          ? replaceEverywhere(old, context.tempId, (m) => ({
              ...m,
              status: "failed",
            }))
          : old,
      );
    },
  });
}
