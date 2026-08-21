/**
 * Sticky day divider ("Today" / "Yesterday" / date). Sticks to the top of the
 * scroll container as its day's messages scroll beneath it.
 */
export function DaySeparator({ label }: { label: string }) {
  if (!label) return null;
  return (
    <div className="sticky top-0 z-10 -mx-1 flex justify-center py-1">
      <span className="rounded-full bg-overlay/90 px-3 py-1 text-[11px] font-medium text-muted ring-1 ring-line backdrop-blur">
        {label}
      </span>
    </div>
  );
}
