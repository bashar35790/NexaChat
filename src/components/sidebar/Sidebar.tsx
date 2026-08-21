"use client";

import { MessageCircle } from "lucide-react";
import { ProfileRow } from "./ProfileRow";
import { ConversationList } from "./ConversationList";

/**
 * Sidebar frame. Sections compose in as they are built:
 * search trigger (T5.4).
 */
export function Sidebar() {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet">
          <MessageCircle className="size-4 text-white" aria-hidden="true" />
        </span>
        <span className="font-display text-base font-semibold tracking-tight">
          NexaChat
        </span>
      </div>

      <ProfileRow />

      <ConversationList />
    </>
  );
}
