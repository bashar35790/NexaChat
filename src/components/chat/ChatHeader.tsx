"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import type { Conversation } from "@/types/api";

/**
 * Conversation header. Group management lives in the details drawer
 * (Phase 8); server permission rules are the source of truth.
 */
export function ChatHeader({
  conversation,
  onBack,
  onDetails,
  onLeave,
}: {
  conversation: Conversation;
  onBack: () => void;
  onDetails: () => void;
  onLeave: () => void;
}) {
  const isDirect = conversation.type === "direct";
  const title = isDirect ? conversation.participant.name : conversation.name;
  const avatarId = isDirect ? conversation.participant._id : conversation._id;
  const subtitle = isDirect
    ? conversation.participant.phone
    : `${conversation.participants.length} members`;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/60 px-3 backdrop-blur sm:px-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to conversations"
        className="-ml-1 rounded-full p-2 text-muted transition-colors hover:bg-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:block md:hidden"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>

      <Avatar id={avatarId} name={title} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{title}</p>
        <p className="truncate text-xs text-faint">{subtitle}</p>
      </div>

      {!isDirect ? (
        <DropdownMenu
          label="Conversation actions"
          trigger={
            <span className="block p-2 text-muted transition-colors hover:text-fg">
              <MoreVertical className="size-5" aria-hidden="true" />
            </span>
          }
          items={[
            { label: "Group details", onSelect: onDetails },
            { label: "Leave group", onSelect: onLeave, danger: true },
          ]}
        />
      ) : null}
    </header>
  );
}
