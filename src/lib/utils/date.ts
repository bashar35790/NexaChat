const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

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
