import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  bumpConversationPreview,
  upsertMessage,
  type MessagesCache,
} from "@/lib/api/messageCache";
import type { Conversation, Message, RawSocketMessage } from "@/types/api";

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
 * own sends — those are confirmed via the REST response in useSendMessage).
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

  const senderName = resolveSenderName(
    queryClient.getQueryData<Conversation[]>(queryKeys.conversations()),
    message.sender,
  );

  queryClient.setQueryData<Conversation[]>(
    queryKeys.conversations(),
    (old) =>
      old ? bumpConversationPreview(old, message.conversation, message) : old,
  );

  const body =
    message.text.length > ANNOUNCE_TEXT_LIMIT
      ? `${message.text.slice(0, ANNOUNCE_TEXT_LIMIT)}…`
      : message.text;

  return { announcement: `${senderName}: ${body}` };
}
