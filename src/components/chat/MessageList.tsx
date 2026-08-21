"use client";

import type { ClientMessage, Conversation } from "@/types/api";
import { groupMessages } from "./grouping";
import { MessageRun } from "./MessageRun";

/**
 * Presentational message feed: ascending-chronological messages grouped into
 * day groups and sender runs. Day separators + timestamps arrive in T6.3.
 */
export function MessageList({
  messages,
  conversation,
}: {
  messages: ClientMessage[];
  conversation: Conversation;
}) {
  const days = groupMessages(messages);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {days.map((day) => (
        <div key={day.key} className="flex flex-col gap-3">
          {/* Sticky day separator — T6.3 */}
          {day.runs.map((run, index) => (
            <MessageRun
              key={`${day.key}-${index}-${run.sender}`}
              run={run}
              conversation={conversation}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
