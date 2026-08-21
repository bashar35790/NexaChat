const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const DAY_FMT = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const DAY_WITH_YEAR_FMT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const TIME_FMT = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function startOfDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** "14:32" style clock time for chat bubbles. Returns "" when unparseable. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return TIME_FMT.format(date);
}

/**
 * Chat day separator label: Today / Yesterday / "Aug 12" (year appended when
 * not the current year). Returns "" when unparseable.
 */
export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const day = startOfDay(date);
  const today = startOfDay(new Date());
  if (day === today) return "Today";
  if (day === today - DAY) return "Yesterday";

  return date.getFullYear() === new Date().getFullYear()
    ? DAY_FMT.format(date)
    : DAY_WITH_YEAR_FMT.format(date);
}

/**
 * Compact list-row timestamp: now → Xm → Xh → Yesterday → weekday → date.
 * Returns "" for unparseable input so callers can omit the node entirely.
 */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < MIN) return "now";
  if (diffMs < HOUR) return `${Math.floor(diffMs / MIN)}m`;
  if (diffMs < DAY) return `${Math.floor(diffMs / HOUR)}h`;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (date.getTime() >= startOfToday.getTime() - DAY) return "Yesterday";
  if (diffMs < 7 * DAY) {
    return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    date,
  );
}
