"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

interface ChatScrollOptions {
  /** Flattened message count — change of this value triggers restoration. */
  messageCount: number;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Scroll-position management for the message feed.
 *
 * Prepending an older page must not move the viewport (plan §3 contract):
 * before fetching we snapshot scrollHeight/scrollTop, and after the new page
 * commits we shift scrollTop by the grown delta — anchoring the previously
 * oldest message exactly where it was. Zero visual jump.
 */
export function useChatScroll({
  messageCount,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ChatScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<{ height: number; top: number } | null>(null);

  const loadOlder = useCallback(() => {
    const el = containerRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    restoreRef.current = { height: el.scrollHeight, top: el.scrollTop };
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const restore = restoreRef.current;
    if (!el || !restore) return;
    el.scrollTop = restore.top + (el.scrollHeight - restore.height);
    restoreRef.current = null;
  }, [messageCount]);

  return { containerRef, loadOlder };
}
