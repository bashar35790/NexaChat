"use client";

import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/date";
import type { Conversation } from "@/types/api";
import { Avatar } from "@/components/ui/Avatar";
import { useUiStore } from "@/stores/uiStore";

/** Whitespace-only texts are storable server-side (ISSUES.md #8) — collapse. */
function previewOf(conversation: Conversation): string | null {
  const text = conversation.lastMessage?.text?.trim();
  return text ? text : null;
}

export function ConversationItem({ conversation }: { conversation: Conversation }) {
  const activeId = useUiStore((s) => s.activeConversationId);
  const openConversation = useUiStore((s) => s.openConversation);

  const isDirect = conversation.type === "direct";
  const title = isDirect ? conversation.participant.name : conversation.name;
  const avatarId = isDirect ? conversation.participant._id : conversation._id;
  const preview = previewOf(conversation);
  const time = formatRelativeTime(conversation.updatedAt);
  const active = activeId === conversation._id;

  return (
    <button
      type="button"
      onClick={() => openConversation(conversation._id)}
      aria-current={active || undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
        active
          ? "bg-primary-soft ring-1 ring-primary/30"
          : "hover:bg-raised",
      )}
    >
      <Avatar id={avatarId} name={title} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              active ? "font-semibold text-fg" : "font-medium text-fg",
            )}
          >
            {title}
          </p>
          {time ? (
            <span
              className={cn(
                "shrink-0 text-[11px]",
                active ? "text-accent" : "text-faint",
              )}
            >
              {time}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "mt-0.5 truncate text-xs",
            preview ? "text-muted" : "italic text-faint",
          )}
        >
          {preview ?? "No messages yet"}
        </p>
      </div>
    </button>
  );
}
