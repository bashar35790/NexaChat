import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  bumpConversationPreview,
  upsertMessage,
  type MessagesCache,
} from "@/lib/api/messageCache";
import {
  removeConversation,
  upsertConversation,
} from "@/lib/api/conversationCache";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import type {
  Conversation,
  ConversationUpdatedPayload,
  Message,
  RawSocketMessage,
} from "@/types/api";

/** Cap for the screen-reader announcement body. */
const ANNOUNCE_TEXT_LIMIT = 120;

/**
 * WS payloads differ from REST shapes: key `id` instead of `_id`, and
 * createdAt as epoch milliseconds instead of ISO-8601 (ISSUES.md #11).
 * Normalization happens at the edge so caches only ever hold REST-shaped
 * entities.
 */
export function normalizeSocketMessage(raw: RawSocketMessage): Message {
  return {
    _id: raw.id,
    conversation: raw.conversation,
    sender: raw.sender,
    text: raw.text,
    createdAt: new Date(raw.createdAt).toISOString(),
  };
}

/** Best-effort display name for announcements; falls back to "Someone". */
function resolveSenderName(
  conversations: Conversation[] | undefined,
  senderId: string,
): string {
  if (!conversations) return "Someone";
  for (const conversation of conversations) {
    if (conversation.type === "direct") {
      if (conversation.participant._id === senderId) {
        return conversation.participant.name;
      }
    } else {
      const member = conversation.participants.find((p) => p._id === senderId);
      if (member) return member.name;
    }
  }
  return "Someone";
}

/**
 * Server→client fan-out for new messages (server does NOT echo the sender's
 * own sends ,those are confirmed via the REST response in useSendMessage).
 * Updates every loaded messages cache for the target conversation plus the
 * conversations preview/order, tolerating caches that don't exist yet.
 */
export function applyIncomingMessage(
  queryClient: QueryClient,
  raw: RawSocketMessage,
): { announcement: string } {
  const message = normalizeSocketMessage(raw);

  queryClient.setQueryData<MessagesCache>(
    queryKeys.messages(message.conversation),
    (old) => (old ? upsertMessage(old, message) : old),
  );

  const conversations = queryClient.getQueryData<Conversation[]>(
    queryKeys.conversations(),
  );
  const conversationExists = conversations?.some(
    (c) => c._id === message.conversation,
  );

  if (!conversationExists) {
    // If the conversation is not yet in our list (e.g. newly started by another user),
    // invalidate conversations so it appears immediately with full enriched participant info.
    void queryClient.invalidateQueries({
      queryKey: queryKeys.conversations(),
    });
  } else {
    queryClient.setQueryData<Conversation[]>(
      queryKeys.conversations(),
      (old) =>
        old ? bumpConversationPreview(old, message.conversation, message) : old,
    );
  }

  const senderName = resolveSenderName(conversations, message.sender);

  const body =
    message.text.length > ANNOUNCE_TEXT_LIMIT
      ? `${message.text.slice(0, ANNOUNCE_TEXT_LIMIT)}…`
      : message.text;

  return { announcement: `${senderName}: ${body}` };
}

/**
 * Group create/rename/membership/admin changes broadcast this event to every
 * member EXCEPT the actor (who already patched their cache from the REST
 * response). Payload is a PARTIAL entity ,merge, never replace, so the
 * locally-known lastMessage/updatedAt ordering survives intact. Unknown
 * conversation ids (e.g. someone created a group with me just now) trigger a
 * list refetch since the partial can't synthesize a valid entity.
 */
export function applyConversationUpdate(
  queryClient: QueryClient,
  payload: ConversationUpdatedPayload,
): void {
  const current = queryClient.getQueryData<Conversation[]>(
    queryKeys.conversations(),
  );
  const existing = current?.find((c) => c._id === payload._id);

  if (!existing) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    return;
  }

  if (existing.type !== "group") return;

  const meId = useAuthStore.getState().user?._id;
  if (
    payload.participants &&
    meId &&
    !payload.participants.some((p) => p._id === meId)
  ) {
    // Current user was removed from the group by an admin
    queryClient.setQueryData<Conversation[]>(
      queryKeys.conversations(),
      (old) => (old ? removeConversation(old, payload._id) : old),
    );
    queryClient.removeQueries({
      queryKey: queryKeys.messages(payload._id),
    });
    if (useUiStore.getState().activeConversationId === payload._id) {
      useUiStore.getState().setActiveConversation(null);
    }
    return;
  }

  queryClient.setQueryData<Conversation[]>(
    queryKeys.conversations(),
    (old) =>
      old
        ? upsertConversation(old, {
            ...existing,
            name: payload.name ?? existing.name,
            admins: payload.admins ?? existing.admins,
            participants: payload.participants ?? existing.participants,
          })
        : old,
  );
}

