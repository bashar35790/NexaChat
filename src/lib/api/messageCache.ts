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
  const exists = cache.pages.some((page) =>
    page.messages.some((m) => m._id === message._id),
  );
  if (exists) return cache;
  return insertIntoNewestPage(cache, message as ClientMessage);
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
