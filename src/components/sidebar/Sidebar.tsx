"use client";

import { MessageCircle, Search } from "lucide-react";
import { ProfileRow } from "./ProfileRow";
import { ConversationList } from "./ConversationList";
import { UserSearchDialog } from "./UserSearchDialog";
import { useStartDirectConversation } from "@/hooks/useStartDirectConversation";
import { useUiStore } from "@/stores/uiStore";
import { useToast } from "@/components/ui/Toast";
import type { User } from "@/types/api";

export function Sidebar() {
  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const openConversation = useUiStore((s) => s.openConversation);
  const startDm = useStartDirectConversation();
  const toast = useToast();

  async function handleSelectUser(user: User) {
    try {
      const created = await startDm.mutateAsync(user);
      setSearchOpen(false);
      openConversation(created._id);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Couldn't start the conversation: ${error.message}`
          : "Couldn't start the conversation.",
      );
    }
  }

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

      <div className="px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-10 w-full items-center gap-2.5 rounded-xl bg-raised px-3.5 text-sm text-faint ring-1 ring-line transition-shadow hover:ring-line-strong focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          Search people…
        </button>
      </div>

      <ConversationList />

      <UserSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(user) => void handleSelectUser(user)}
      />
    </>
  );
}
