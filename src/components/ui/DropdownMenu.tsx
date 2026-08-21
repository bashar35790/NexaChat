"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onSelect: () => void;
}

export function DropdownMenu({
  trigger,
  items,
  align = "end",
  label,
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={label}
          className={cn(
            "absolute top-full z-40 mt-2 min-w-44 overflow-hidden rounded-xl bg-overlay p-1.5 shadow-pop ring-1 ring-line-strong",
            "animate-in fade-in slide-in-from-top-1 duration-100",
            align === "end" ? "right-0" : "left-0",
          )}
          onMouseLeave={() => setOpen(false)}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                item.danger
                  ? "text-danger hover:bg-danger/10"
                  : "text-muted hover:bg-raised hover:text-fg",
              )}
            >
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0 [&>svg]:size-4">
                  {item.icon}
                </span>
              ) : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
