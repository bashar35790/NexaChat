import type { ClientMessage } from "@/types/api";

export interface MessageRun {
  sender: string;
  messages: ClientMessage[];
}

export interface DayGroup {
  /** Local-day key (year-month-day) used for React keys and separators. */
  key: string;
  runs: MessageRun[];
}

/** Messages from the same sender within this window share a run. */
const RUN_GAP_MS = 5 * 60_000;

function dayKeyOf(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Groups an ascending-chronological message list into day groups and
 * consecutive-sender runs (avatar/name shown once per run). A run breaks on
 * sender change, a >5min gap, or a day boundary.
 */
export function groupMessages(messages: ClientMessage[]): DayGroup[] {
  const days: DayGroup[] = [];

  for (const message of messages) {
    const key = dayKeyOf(message.createdAt);
    const currentDay = days.at(-1);

    let day = currentDay;
    if (!day || day.key !== key) {
      day = { key, runs: [] };
      days.push(day);
    }

    const run = day.runs.at(-1);
    const previous = run?.messages.at(-1);
    const continuesRun =
      run !== undefined &&
      previous !== undefined &&
      run.sender === message.sender &&
      new Date(message.createdAt).getTime() -
        new Date(previous.createdAt).getTime() <
        RUN_GAP_MS;

    if (continuesRun && run) {
      run.messages.push(message);
    } else {
      day.runs.push({ sender: message.sender, messages: [message] });
    }
  }

  return days;
}
