"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConversations } from "@/hooks/useConversations";
import { useInfiniteMessages } from "@/hooks/useInfiniteMessages";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/uiStore";

function HistorySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-1 flex-col justify-end gap-3 px-4 py-4"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn("flex items-end gap-2", i % 2 ? "justify-end" : "justify-start")}
        >
          {i % 2 === 0 ? <Skeleton className="size-7 shrink-0 rounded-full" /> : null}
          <Skeleton className={cn("h-9", i % 3 === 0 ? "w-40" : i % 3 === 1 ? "w-64" : "w-52")} />
        </div>
      ))}
    </div>
  );
}

/**
 * Right-hand chat panel: header + message area + composer. Pagination and the
 * auto-scroll engine compose in across T6.5–T6.8.
 */
export function ChatPanel() {
  const activeId = useUiStore((s) => s.activeConversationId);
  const setMobilePane = useUiStore((s) => s.setMobilePane);
  const { data: conversations } = useConversations();

  const conversation = conversations?.find((c) => c._id === activeId) ?? null;
  const {
    data: messages,
    isPending,
    isError,
    refetch,
  } = useInfiniteMessages(conversation?._id ?? null);

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

  let body: React.ReactNode;
  if (isPending) {
    body = <HistorySkeleton />;
  } else if (isError) {
    body = (
      <ErrorState
        className="flex-1"
        message="Couldn't load this conversation."
        onRetry={() => void refetch()}
      />
    );
  } else if (!messages.length) {
    body = (
      <EmptyState
        className="flex-1"
        icon={<Sparkles />}
        title="No messages yet"
        description="Send the first message — say hi."
      />
    );
  } else {
    body = (
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <MessageList messages={messages} conversation={conversation} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        conversation={conversation}
        onBack={() => setMobilePane("list")}
      />
      {body}
      {/* Composer — T6.7/T6.8 */}
    </div>
  );
}
