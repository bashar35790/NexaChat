import { cn } from "@/lib/utils/cn";

const SIZES = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-lg",
} as const;

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0]?.charAt(0) ?? "";
  const second = words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? "") : "";
  return (first + second).toUpperCase();
}

/** Deterministic hue from a stable string id so a user always gets the same color. */
function hueOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return ((h % 360) + 360) % 360;
}

export function Avatar({
  name,
  id,
  size = "md",
  className,
}: {
  name: string;
  /** Stable identifier used to derive the avatar hue (user id or conversation id). */
  id: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const hue = hueOf(id);
  return (
    <span
      aria-hidden="true"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 65% 52%), hsl(${(hue + 40) % 360} 65% 42%))`,
      }}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
        SIZES[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
