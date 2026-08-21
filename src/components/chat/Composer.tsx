"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/** ~6 rows at 24px line-height, then the textarea scrolls internally. */
const MAX_HEIGHT_PX = 144;
/**
 * Server accepts unbounded texts (probing: 10k chars stored) — this client
 * cap keeps payloads sane and the composer usable.
 */
const MAX_LENGTH = 4000;

export function Composer({
  onSend,
  sending = false,
}: {
  /** Resolves when the send pipeline finishes (optimistic entry created). */
  onSend: (text: string) => Promise<unknown>;
  sending?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: reset to auto, measure, clamp to the row cap.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const trimmed = value.trim();
  const canSend = Boolean(trimmed) && !sending;
  const nearLimit = value.length > MAX_LENGTH * 0.9;

  function send() {
    if (!canSend) return;
    const text = trimmed;
    setValue("");
    void onSend(text);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter newlines. IME composition must not send.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="shrink-0 border-t border-line bg-surface/60 p-3 backdrop-blur">
      <div className="flex items-end gap-2">
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            maxLength={MAX_LENGTH}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            aria-label="Message text"
            className={cn(
              "block w-full resize-none rounded-2xl bg-raised px-4 py-2.5 text-sm leading-6 text-fg",
              "ring-1 ring-line transition-shadow duration-150",
              "placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary",
              "overflow-y-auto",
            )}
          />
          {nearLimit ? (
            <span
              className={cn(
                "pointer-events-none absolute -top-5 right-1 text-[10px]",
                value.length >= MAX_LENGTH ? "text-danger" : "text-faint",
              )}
            >
              {value.length}/{MAX_LENGTH}
            </span>
          ) : null}
        </div>

        <Button
          size="lg"
          loading={sending}
          disabled={!trimmed}
          onClick={send}
          aria-label="Send message"
          className="shrink-0 !px-4"
        >
          {!sending ? (
            <SendHorizontal className="size-5" aria-hidden="true" />
          ) : null}
        </Button>
      </div>
    </div>
  );
}
