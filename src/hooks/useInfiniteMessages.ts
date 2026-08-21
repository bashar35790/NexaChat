"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessageHistory } from "@/lib/api/messages";
import { queryKeys } from "@/lib/api/queryKeys";
import type { ClientMessage } from "@/types/api";

/**
 * Flattens newest-first cursor pages into one ascending-chronological array.
 * Dedupe by id is REQUIRED: the server's `before` cursor is inclusive and
 * re-sends the boundary message at the top of each older page (ISSUES.md #11).
 * The final sort is an ordering guard against any out-of-order arrival.
 */
function flattenPages(pages: { messages: ClientMessage[] }[]): ClientMessage[] {
  const seen = new Set<string>();
  const flat: ClientMessage[] = [];
  for (const page of pages) {
    for (const message of page.messages) {
      if (seen.has(message._id)) continue;
      seen.add(message._id);
      flat.push(message);
    }
  }
  flat.reverse();
  return flat.sort((a, b) =>
    a.createdAt === b.createdAt
      ? a._id.localeCompare(b._id)
      : a.createdAt.localeCompare(b.createdAt),
  );
}

export function useInfiniteMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages(conversationId ?? "none"),
    queryFn: ({ pageParam }) =>
      fetchMessageHistory(conversationId as string, { before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      // Oldest message of the loaded set becomes the next (inclusive) cursor.
      return lastPage.messages.at(-1)?._id;
    },
    enabled: Boolean(conversationId),
    select: (data) => flattenPages(data.pages),
  });
}
