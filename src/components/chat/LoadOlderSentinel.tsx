"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Invisible trigger pinned above the feed: when it enters the (padded) view,
 * the next older page loads. The observer detaches while loading/exhausted;
 * the spinner shows only during an active fetch.
 */
export function LoadOlderSentinel({
  containerRef,
  onLoad,
  disabled,
  loading,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLoad: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = containerRef.current;
    if (!sentinel || !root || disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoad();
      },
      // Start loading before the user physically reaches the top.
      { root, rootMargin: "400px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [containerRef, onLoad, disabled]);

  return (
    <div ref={sentinelRef} aria-hidden="true" className="h-px">
      {loading ? (
        <div className="flex justify-center py-2">
          <Spinner size="sm" label="Loading older messages" />
        </div>
      ) : null}
    </div>
  );
}
