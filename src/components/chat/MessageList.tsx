"use client";

import { Fragment } from "react";
import type { ClientMessage, Conversation } from "@/types/api";
import { formatDayLabel } from "@/lib/utils/date";
import { groupMessages } from "./grouping";
import { MessageRun } from "./MessageRun";
import { DaySeparator } from "./DaySeparator";

/** Full-width marker line above the first message that arrived while away. */
function UnreadDivider() {
  return (
    <div
      role="separator"
      aria-label="New messages below"
      className="flex items-center gap-2 px-1 py-0.5"
    >
      <span className="h-px min-w-8 flex-1 bg-primary/50" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
        New
      </span>
      <span className="h-px min-w-8 flex-1 bg-primary/50" />
    </div>
  );
}

/**
 * Presentational message feed: ascending-chronological messages grouped into
 * sticky day separators and consecutive-sender runs.
 */
export function MessageList({
  messages,
  conversation,
  firstUnreadId,
  onRetry,
}: {
  messages: ClientMessage[];
  conversation: Conversation;
  /** First message that arrived while the user was scrolled away. */
  firstUnreadId?: string | null;
  /** Retry affordance for failed sends (passed to matching bubbles). */
  onRetry?: (message: ClientMessage) => void;
}) {
  const days = groupMessages(messages);

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      {days.map((day) => {
        const runContainsFirstUnread = (run: { messages: ClientMessage[] }) =>
          firstUnreadId != null &&
          run.messages.some((m) => m._id === firstUnreadId);

        return (
          <div key={day.key} className="flex flex-col gap-3.5">
            <DaySeparator
              label={formatDayLabel(day.runs[0]?.messages[0]?.createdAt ?? "")}
            />
            {day.runs.map((run, index) => (
              <Fragment key={`${day.key}-${index}-${run.sender}`}>
                {runContainsFirstUnread(run) ? <UnreadDivider /> : null}
                <MessageRun
                  run={run}
                  conversation={conversation}
                  onRetry={onRetry}
                />
              </Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}
