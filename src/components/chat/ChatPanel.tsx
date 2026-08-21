"use client";

import { MessageCircle } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { EmptyState } from "@/components/ui/EmptyState";
import { useConversations } from "@/hooks/useConversations";
import { useUiStore } from "@/stores/uiStore";

/**
 * Right-hand chat panel: header + message area. The composer joins in
 * T6.7/T6.8.
 */
export function ChatPanel() {
  const activeId = useUiStore((s) => s.activeConversationId);
  const setMobilePane = useUiStore((s) => s.setMobilePane);
  const { data: conversations } = useConversations();

  const conversation = conversations?.find((c) => c._id === activeId) ?? null;

  if (!conversation) {
    return (
      <EmptyState
        className="h-full"
        icon={<MessageCircle />}
        title="Select a conversation"
        description="Pick a chat from the list, or search for someone to start a new conversation."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        conversation={conversation}
        onBack={() => setMobilePane("list")}
      />
      {/* Keyed remount per conversation resets scroll/arrival state. */}
      <ChatMessages key={conversation._id} conversation={conversation} />
      {/* Composer — T6.7/T6.8 */}
    </div>
  );
}
