"use client";

import type { ClientMessage, Conversation } from "@/types/api";
import { formatDayLabel } from "@/lib/utils/date";
import { groupMessages } from "./grouping";
import { MessageRun } from "./MessageRun";
import { DaySeparator } from "./DaySeparator";

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
    <div className="flex flex-col gap-4 px-4 py-4">
      {days.map((day) => (
        <div key={day.key} className="flex flex-col gap-3">
          <DaySeparator
            label={formatDayLabel(day.runs[0]?.messages[0]?.createdAt ?? "")}
          />
          {day.runs.map((run, index) => (
            <MessageRun
              key={`${day.key}-${index}-${run.sender}`}
              run={run}
              conversation={conversation}
              firstUnreadId={firstUnreadId}
              onRetry={onRetry}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
