"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/uiStore";

/**
 * Responsive workspace shell (plan §5):
 * - ≥1024px: persistent 360px sidebar beside the chat panel.
 * - 768–1023px: sidebar as an overlay drawer (menu button in chat area).
 * - <768px: single-pane switcher — list ⇄ conversation via uiStore.
 */
export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const mobilePane = useUiStore((s) => s.mobilePane);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-base">
      {/* Tablet drawer backdrop (md–lg only) */}
      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-[2px] md:max-lg:block"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-full flex-col border-r border-line bg-surface",
          "transition-transform duration-200 ease-out md:w-[360px]",
          // mobile: pane switcher decides
          mobilePane === "list"
            ? "max-md:translate-x-0"
            : "max-md:-translate-x-full",
          // tablet: drawer toggle decides
          drawerOpen ? "md:translate-x-0" : "md:-translate-x-full",
          // desktop: persistent column
          "lg:static lg:z-auto lg:w-[360px] lg:shrink-0 lg:translate-x-0",
        )}
      >
        {sidebar}
      </aside>

      <section
        className={cn(
          "relative flex min-w-0 flex-1 flex-col",
          mobilePane === "chat" ? "max-md:flex" : "max-md:hidden",
        )}
      >
        {/* Tablet-only drawer trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open conversations menu"
          className="absolute left-3 top-3 z-20 rounded-xl bg-surface/80 p-2 text-muted ring-1 ring-line backdrop-blur transition-colors hover:text-fg md:max-lg:block max-md:hidden lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {children}
      </section>
    </div>
  );
}
