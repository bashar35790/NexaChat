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
}: {
  messages: ClientMessage[];
  conversation: Conversation;
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
            />
          ))}
        </div>
      ))}
    </div>
  );
}
