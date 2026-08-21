"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/date";
import { hueOf } from "@/components/ui/Avatar";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import type { ClientMessage, Conversation } from "@/types/api";
import type { MessageRun as MessageRunModel } from "./grouping";
import { MessageBubble } from "./MessageBubble";

/** Marker line above the first message that arrived while the user was away. */
function UnreadDivider() {
  return (
    <div
      role="separator"
      aria-label="New messages below"
      className="my-1.5 flex w-full items-center gap-2"
    >
      <span className="h-px min-w-6 flex-1 bg-primary/50" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
        New
      </span>
      <span className="h-px min-w-6 flex-1 bg-primary/50" />
    </div>
  );
}

/**
 * One consecutive-sender run: avatar (theirs) and colored sender name
 * (groups) render once, followed by that sender's stacked bubbles.
 */
export function MessageRun({
  run,
  conversation,
  firstUnreadId,
  onRetry,
}: {
  run: MessageRunModel;
  conversation: Conversation;
  /** First message that arrived while the user was scrolled away. */
  firstUnreadId?: string | null;
  /** Retry affordance for failed sends (passed to matching bubbles). */
  onRetry?: (message: ClientMessage) => void;
}) {
  const meId = useAuthStore((s) => s.user?._id);
  const mine = run.sender === meId;
  const isGroup = conversation.type === "group";

  const sender = isGroup
    ? conversation.participants.find((p) => p._id === run.sender)
    : undefined;
  const senderName = sender?.name ?? "Unknown";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        mine ? "justify-end" : "justify-start",
      )}
    >
      {!mine ? (
        <Avatar
          id={run.sender}
          name={isGroup ? senderName : conversation.participant.name}
          size="xs"
          className="mb-0.5"
        />
      ) : null}

      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          mine ? "items-end" : "items-start",
        )}
      >
        {isGroup && !mine ? (
          <span
            className="px-1 text-xs font-semibold"
            style={{ color: `hsl(${hueOf(run.sender)} 70% 68%)` }}
          >
            {senderName}
          </span>
        ) : null}

        {run.messages.map((message, index) => (
          <Fragment key={message._id}>
            {message._id === firstUnreadId ? <UnreadDivider /> : null}
            <MessageBubble
              message={message}
              mine={mine}
              last={index === run.messages.length - 1}
              onRetry={
                message.status === "failed" && onRetry
                  ? () => onRetry(message)
                  : undefined
              }
            />
          </Fragment>
        ))}

        {(() => {
          const time = formatTime(run.messages.at(-1)?.createdAt ?? "");
          return time ? (
            <span className="px-1 text-[10px] text-faint">{time}</span>
          ) : null;
        })()}
      </div>
    </div>
  );
}
