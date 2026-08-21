import type { InfiniteData } from "@tanstack/react-query";
import type {
  ClientMessage,
  Conversation,
  Message,
  MessagePage,
} from "@/types/api";

export type MessagesCache = InfiniteData<MessagePage>;

export function mapAllPages(
  cache: MessagesCache,
  fn: (messages: ClientMessage[]) => ClientMessage[],
): MessagesCache {
  return {
    ...cache,
    pages: cache.pages.map((page) => ({ ...page, messages: fn(page.messages) })),
  };
}

export function removeMessage(cache: MessagesCache, id: string): MessagesCache {
  return mapAllPages(cache, (messages) => messages.filter((m) => m._id !== id));
}

export function replaceEverywhere(
  cache: MessagesCache,
  id: string,
  transform: (message: ClientMessage) => ClientMessage,
): MessagesCache {
  return mapAllPages(
    cache,
    (messages) => messages.map((m) => (m._id === id ? transform(m) : m)),
  );
}

/**
 * Pages are newest-first; new arrivals belong at the head of the FIRST page,
 * inserted by descending timestamp so clock skew / out-of-order delivery can't
 * corrupt order (ordering guard).
 */
function insertIntoNewestPage(
  cache: MessagesCache,
  message: ClientMessage,
): MessagesCache {
  const [firstPage, ...rest] = cache.pages;
  if (!firstPage) {
    return {
      pages: [{ messages: [message], hasMore: false }],
      pageParams: cache.pageParams,
    };
  }
  const messages = [...firstPage.messages];
  const index = messages.findIndex((m) => m.createdAt <= message.createdAt);
  if (index === -1) messages.push(message);
  else messages.splice(index, 0, message);
  return { ...cache, pages: [{ ...firstPage, messages }, ...rest] };
}

/** Id-based dedupe, then timestamp-sorted insert into the newest page. */
export function upsertMessage(
  cache: MessagesCache,
  message: Message | ClientMessage,
): MessagesCache {
  // Rule 1 — exact id match: already represented, nothing to do.
  const exists = cache.pages.some((page) =>
    page.messages.some((m) => m._id === message._id),
  );
  if (exists) return cache;

  // Rule 2 — content-window fallback: a just-sent optimistic bubble whose
  // server confirmation arrived through another channel (or a duplicated
  // delivery) is UPGRADED in place instead of inserted twice.
  const tempId = findTempMatch(cache, message);
  if (tempId) {
    return replaceEverywhere(cache, tempId, () => ({ ...message }));
  }

  return insertIntoNewestPage(cache, message as ClientMessage);
}

/** Window inside which identical sender+content counts as the same message. */
const TEMP_MATCH_WINDOW_MS = 15_000;

/**
 * Fallback dedupe key: sender + conversation + trimmed text within a short
 * window of the incoming timestamp, matching only LOCAL optimistic entries
 * (server data never carries a status).
 */
function findTempMatch(
  cache: MessagesCache,
  message: Message,
): string | null {
  const target = Date.parse(message.createdAt);
  for (const page of cache.pages) {
    for (const m of page.messages as ClientMessage[]) {
      if (!m.status || m.status === "failed") continue;
      if (m.sender !== message.sender) continue;
      if (m.text.trim() !== message.text.trim()) continue;
      if (Math.abs(Date.parse(m.createdAt) - target) > TEMP_MATCH_WINDOW_MS) {
        continue;
      }
      return m._id;
    }
  }
  return null;
}

/** Moves the conversation to the top of the list with a fresh preview. */
export function bumpConversationPreview(
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
