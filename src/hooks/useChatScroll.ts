"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Stick-to-bottom tolerance (plan §5 contract). */
const STICK_THRESHOLD_PX = 120;

interface ChatScrollOptions {
  /** Flattened message count — its changes drive stick/unread decisions. */
  messageCount: number;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Auto-scroll engine for the message feed (plan §5 contract):
 * - prepends restore exact viewport position (zero visual jump);
 * - growth sticks to bottom ONLY while the user is within ~120px of it;
 * - otherwise arrivals accumulate into an unread count surfaced as a pill;
 * - returning to the bottom clears the count and resumes stickiness.
 */
export function useChatScroll({
  messageCount,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ChatScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<{ height: number; top: number } | null>(null);
  const prevCountRef = useRef(0);
  /** Ref mirror for imperative/layout-effect decisions (no stale closures). */
  const atBottomRef = useRef(true);

  const [atBottom, setAtBottom] = useState(true);
  // Single source of truth for arrival accounting; adjusted during render
  // (derived-state pattern) because it is fully derived from messageCount.
  // Uses the at-bottom STATE (render-safe); starts true so the very first
  // page load never counts as unread.
  const [feed, setFeed] = useState({ seen: messageCount, unread: 0 });
  if (feed.seen !== messageCount) {
    const added = messageCount - feed.seen;
    setFeed({
      seen: messageCount,
      unread: added > 0 && !atBottom ? feed.unread + added : 0,
    });
  }

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Stickiness tracking on user scroll.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const bottom = distance <= STICK_THRESHOLD_PX;
      atBottomRef.current = bottom;
      setAtBottom(bottom);
      if (bottom) {
        setFeed((current) =>
          current.unread === 0 ? current : { ...current, unread: 0 },
        );
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Prepend restoration + stick/jump on growth (post-DOM-commit, pre-paint).
  useLayoutEffect(() => {
    const el = containerRef.current;

    const restore = restoreRef.current;
    if (el && restore) {
      el.scrollTop = restore.top + (el.scrollHeight - restore.height);
      restoreRef.current = null;
    }

    const previous = prevCountRef.current;
    prevCountRef.current = messageCount;
    if (!el || messageCount <= previous) return;
    // First load of a conversation, or user already near the bottom: follow.
    if (previous === 0 || atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
      setAtBottom(true);
    }
  }, [messageCount]);

  const loadOlder = useCallback(() => {
    const el = containerRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    restoreRef.current = { height: el.scrollHeight, top: el.scrollTop };
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return { containerRef, loadOlder, atBottom, unreadCount: feed.unread, scrollToBottom };
}
