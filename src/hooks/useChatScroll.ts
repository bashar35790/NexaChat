"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { ClientMessage } from "@/types/api";

/** Stick-to-bottom tolerance (plan §5 contract). */
const STICK_THRESHOLD_PX = 120;

interface ChatScrollOptions {
  /**
   * Ascending-chronological messages — identity (ids + senders) drives stick,
   * unread, and first-unread decisions. ID anchoring means pagination
   * prepends never register as arrivals.
   */
  messages: ClientMessage[];
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

interface FeedState {
  /** Id of the newest message accounted for (anchor for append detection). */
  lastId: string | null;
  unread: number;
  /** First message that arrived while away — renders the "New" divider. */
  firstUnreadId: string | null;
}

/**
 * Auto-scroll engine for the message feed (plan §5 contract):
 * - prepends restore exact viewport position (zero visual jump);
 * - growth sticks to bottom ONLY while the user is within ~120px of it;
 * - otherwise arrivals accumulate into an unread count surfaced as a pill,
 *   and the first unseen OTHER-person message gets a divider marker;
 * - returning to the bottom clears both and resumes stickiness.
 */
export function useChatScroll({
  messages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ChatScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<{ height: number; top: number } | null>(null);
  const prevCountRef = useRef(0);
  /** Ref mirror for imperative/layout-effect decisions (no stale closures). */
  const atBottomRef = useRef(true);

  const meId = useAuthStore((s) => s.user?._id);
  const lastMessageId = messages.at(-1)?._id ?? null;

  const [atBottom, setAtBottom] = useState(true);
  // Single source of truth for arrival accounting; adjusted during render
  // (derived-state pattern) because it is fully derived from `messages`.
  // Uses the at-bottom STATE (render-safe); anchored to the first rendered
  // page so the very first load never counts as unread.
  const [feed, setFeed] = useState<FeedState>(() => ({
    lastId: lastMessageId,
    unread: 0,
    firstUnreadId: null,
  }));
  if (feed.lastId !== lastMessageId) {
    const anchorIndex = feed.lastId
      ? messages.findIndex((m) => m._id === feed.lastId)
      : -1;
    // Anchor lost (full cache replace / deduped re-sort): absorb silently —
    // only a verifiable append counts as an arrival.
    const appended =
      anchorIndex >= 0 ? messages.slice(anchorIndex + 1) : [];
    const incoming = appended.filter((m) => m.sender !== meId);
    const away = appended.length > 0 && !atBottom;
    setFeed({
      lastId: lastMessageId,
      unread: away ? feed.unread + incoming.length : 0,
      firstUnreadId:
        away ? (feed.firstUnreadId ?? incoming[0]?._id ?? null) : null,
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
          current.unread === 0 && current.firstUnreadId === null
            ? current
            : { ...current, unread: 0, firstUnreadId: null },
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

    const previousCount = prevCountRef.current;
    prevCountRef.current = messages.length;
    if (!el || messages.length <= previousCount) return;
    // First load of a conversation, or user already near the bottom: follow.
    if (previousCount === 0 || atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
      setAtBottom(true);
    }
  }, [messages.length]);

  const loadOlder = useCallback(() => {
    const el = containerRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    restoreRef.current = { height: el.scrollHeight, top: el.scrollTop };
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    containerRef,
    loadOlder,
    atBottom,
    unreadCount: feed.unread,
    firstUnreadId: feed.firstUnreadId,
    scrollToBottom,
  };
}
