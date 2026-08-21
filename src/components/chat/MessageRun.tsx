"use client";

import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/date";
import { hueOf } from "@/components/ui/Avatar";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import type { ClientMessage, Conversation } from "@/types/api";
import type { MessageRun as MessageRunModel } from "./grouping";
import { MessageBubble } from "./MessageBubble";

/**
 * One consecutive-sender run: avatar (theirs) and colored sender name
 * (groups) render once, followed by that sender's stacked bubbles.
 */
export function MessageRun({
  run,
  conversation,
  onRetry,
}: {
  run: MessageRunModel;
  conversation: Conversation;
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
        "flex items-end gap-2.5",
        mine ? "justify-end" : "justify-start",
      )}
    >
      {!mine ? (
        <Avatar
          id={run.sender}
          name={isGroup ? senderName : conversation.participant.name}
          size="xs"
          className="mb-1 shrink-0"
        />
      ) : null}

      <div
        className={cn(
          "flex min-w-0 flex-col gap-1.5",
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
          <MessageBubble
            key={message._id}
            message={message}
            mine={mine}
            last={index === run.messages.length - 1}
            onRetry={
              message.status === "failed" && onRetry
                ? () => onRetry(message)
                : undefined
            }
          />
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
