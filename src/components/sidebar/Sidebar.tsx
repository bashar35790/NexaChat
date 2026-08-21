"use client";

import { useState } from "react";
import { MessageCircle, Search, Users } from "lucide-react";
import { ProfileRow } from "./ProfileRow";
import { ConversationList } from "./ConversationList";
import { UserSearchDialog } from "./UserSearchDialog";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
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
  const [groupWizardOpen, setGroupWizardOpen] = useState(false);

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

      <div className="flex gap-2 px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-raised px-3.5 text-sm text-faint ring-1 ring-line transition-shadow hover:ring-line-strong focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          Search people…
        </button>
        <button
          type="button"
          onClick={() => setGroupWizardOpen(true)}
          aria-label="Create a group"
          title="Create a group"
          className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-raised px-3 text-muted ring-1 ring-line transition-colors hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <Users className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ConversationList />

      <UserSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(user) => void handleSelectUser(user)}
      />

      <CreateGroupDialog
        open={groupWizardOpen}
        onClose={() => setGroupWizardOpen(false)}
        onCreated={(group) => {
          toast.success("Group created.");
          openConversation(group._id);
        }}
      />
    </>
  );
}
