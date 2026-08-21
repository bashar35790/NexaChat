"use client";

import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import { MessageList } from "./MessageList";
import { LoadOlderSentinel } from "./LoadOlderSentinel";
import { NewMessagesPill } from "./NewMessagesPill";
import { Composer } from "./Composer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInfiniteMessages } from "@/hooks/useInfiniteMessages";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useSendMessage, type SendPayload } from "@/hooks/useSendMessage";
import { cn } from "@/lib/utils/cn";
import type { Conversation } from "@/types/api";

function HistorySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-1 flex-col justify-end gap-3 px-4 py-4"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "flex items-end gap-2",
            i % 2 ? "justify-end" : "justify-start",
          )}
        >
          {i % 2 === 0 ? (
            <Skeleton className="size-7 shrink-0 rounded-full" />
          ) : null}
          <Skeleton
            className={cn(
              "h-9",
              i % 3 === 0 ? "w-40" : i % 3 === 1 ? "w-64" : "w-52",
            )}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Scrollable message area for one conversation. Remounted per conversation
 * (keyed by id upstream) so scroll/arrival state resets cleanly.
 */
export function ChatMessages({ conversation }: { conversation: Conversation }) {
  const {
    data: messages,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMessages(conversation._id);

  const sendMutation = useSendMessage(conversation._id);
  const handleSend = useCallback(
    (payload: SendPayload) => sendMutation.mutateAsync(payload),
    [sendMutation],
  );

  const { containerRef, loadOlder, atBottom, unreadCount, scrollToBottom } =
    useChatScroll({
      messageCount: messages?.length ?? 0,
      fetchNextPage,
      hasNextPage: Boolean(hasNextPage),
      isFetchingNextPage,
    });

  const scrollToBottomSmooth = useCallback(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollToBottom(reduced ? "auto" : "smooth");
  }, [scrollToBottom]);

  const loaded = !isPending && !isError;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {isPending ? (
          <HistorySkeleton />
        ) : isError ? (
          <ErrorState
            message="Couldn't load this conversation."
            onRetry={() => void refetch()}
          />
        ) : !messages.length ? (
          <EmptyState
            className="h-full"
            icon={<Sparkles />}
            title="No messages yet"
            description="Send the first message — say hi."
          />
        ) : (
          <>
            <LoadOlderSentinel
              containerRef={containerRef}
              onLoad={loadOlder}
              disabled={!hasNextPage || isFetchingNextPage}
              loading={isFetchingNextPage}
            />
            {!hasNextPage ? (
              <p className="py-2 text-center text-[11px] text-faint">
                This is the beginning of your conversation.
              </p>
            ) : null}
            <MessageList
              messages={messages}
              conversation={conversation}
              onRetry={(message) =>
                void handleSend({ text: message.text, failedTempId: message._id })
              }
            />
          </>
        )}
      </div>

      {loaded && !atBottom && unreadCount > 0 ? (
        <NewMessagesPill count={unreadCount} onClick={scrollToBottomSmooth} />
      ) : null}

      <Composer
        sending={sendMutation.isPending}
        onSend={(text) => handleSend({ text })}
      />
    </div>
  );
}
