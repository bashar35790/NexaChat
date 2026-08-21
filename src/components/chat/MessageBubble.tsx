"use client";

import { AlertCircle, Clock } from "lucide-react";
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
  onRetry,
}: {
  message: ClientMessage;
  mine: boolean;
  /** Last bubble in a run — tightens the corner nearest the avatar column. */
  last: boolean;
  /** Present only on failed sends — renders the retry affordance. */
  onRetry?: () => void;
}) {
  const pending = message.status === "pending";
  const failed = message.status === "failed";

  return (
    <div
      className={cn(
        // Sizing: parent column is already capped at 78% of chat width
        "w-fit min-w-[6rem]",
        // Shape & spacing
        "rounded-2xl px-4 py-2.5",
        // Typography
        "text-[15px] font-normal leading-[1.65] tracking-wide",
        "whitespace-pre-wrap break-words",
        mine
          ? "bg-gradient-to-br from-primary to-violet text-white shadow-glow"
          : "bg-raised text-fg",
        failed
          ? "ring-1 ring-danger/60"
          : mine
            ? "ring-1 ring-white/15"
            : "ring-1 ring-line",
        pending && "opacity-70",
        last && (mine ? "rounded-br-sm" : "rounded-bl-sm"),
      )}
      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
    >
      {renderText(message.text)}

      {pending ? (
        <Clock
          className="ml-1.5 inline size-3 align-baseline opacity-70"
          aria-label="Sending"
        />
      ) : null}

      {failed ? (
        <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-danger">
          <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
          Failed to send
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full px-2 py-0.5 underline underline-offset-2 transition-colors hover:bg-danger/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              Retry
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

