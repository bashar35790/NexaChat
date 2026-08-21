"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { sendMessage } from "@/lib/api/messages";
import { queryKeys } from "@/lib/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import type {
  ClientMessage,
  Conversation,
  Message,
  MessagePage,
} from "@/types/api";

type MessagesCache = InfiniteData<MessagePage>;

export interface SendPayload {
  text: string;
  /** When retrying a failed bubble, its temp id is replaced by the new try. */
  failedTempId?: string;
}

function makeTempId(): string {
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapAllPages(
  cache: MessagesCache,
  fn: (messages: ClientMessage[]) => ClientMessage[],
): MessagesCache {
  return {
    ...cache,
    pages: cache.pages.map((page) => ({ ...page, messages: fn(page.messages) })),
  };
}

function removeMessage(cache: MessagesCache, id: string): MessagesCache {
  return mapAllPages(
    cache,
    (messages) => messages.filter((m) => m._id !== id),
  );
}

/**
 * New sends are the chronologically newest entries → head of the FIRST page
 * (pages are newest-first), inserted by descending timestamp so clock skew
 * can't corrupt order (ordering guard).
 */
function prependToFirstPage(cache: MessagesCache, temp: ClientMessage): MessagesCache {
  const [firstPage, ...rest] = cache.pages;
  if (!firstPage) {
    return { pages: [{ messages: [temp], hasMore: false }], pageParams: cache.pageParams };
  }
  const messages = [...firstPage.messages];
  const index = messages.findIndex((m) => m.createdAt <= temp.createdAt);
  if (index === -1) messages.push(temp);
  else messages.splice(index, 0, temp);
  return { ...cache, pages: [{ ...firstPage, messages }, ...rest] };
}

function replaceEverywhere(
  cache: MessagesCache,
  id: string,
  transform: (message: ClientMessage) => ClientMessage,
): MessagesCache {
  return mapAllPages(
    cache,
    (messages) => messages.map((m) => (m._id === id ? transform(m) : m)),
  );
}

/** Moves the conversation to the top of the list with a fresh preview. */
function bumpConversationPreview(
  conversations: Conversation[],
  conversationId: string,
  message: Message,
): Conversation[] {
  return conversations
    .map((c) =>
      c._id === conversationId
        ? {
            ...c,
            lastMessage: {
              text: message.text,
              sender: message.sender,
              createdAt: message.createdAt,
            },
            updatedAt: message.createdAt,
          }
        : c,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
          return {
            pages: [{ messages: [temp], hasMore: false }],
            pageParams: [undefined],
          };
        }
        return prependToFirstPage(base, temp);
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
