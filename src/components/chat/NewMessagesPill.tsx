"use client";

import { ArrowDown } from "lucide-react";

/**
 * Floating "N new messages" pill: shown only while the user is scrolled away
 * from the bottom as messages arrive; click smooth-scrolls back down.
 */
export function NewMessagesPill({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-medium text-white shadow-glow transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {count} new {count === 1 ? "message" : "messages"}
      <ArrowDown className="size-3.5" aria-hidden="true" />
    </button>
  );
}
