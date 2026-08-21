"use client";

import { cn } from "@/lib/utils/cn";
import type { ClientMessage } from "@/types/api";

/** Whitespace-only texts are storable server-side (ISSUES.md #8) — collapse. */
function renderText(text: string) {
  if (text.trim()) return text;
  return <em className="opacity-60">Empty message</em>;
}

export function MessageBubble({
  message,
  mine,
  last,
}: {
  message: ClientMessage;
  mine: boolean;
  /** Last bubble in a run — tightens the corner nearest the avatar column. */
  last: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-[min(75%,34rem)] whitespace-pre-wrap break-words px-3.5 py-2 text-sm leading-relaxed",
        mine
          ? "rounded-2xl bg-gradient-to-br from-primary to-violet text-white shadow-glow"
          : "bg-raised text-fg ring-1 ring-line",
        last && (mine ? "rounded-br-md" : "rounded-bl-md"),
      )}
    >
      {renderText(message.text)}
    </div>
  );
}
