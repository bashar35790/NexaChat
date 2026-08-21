"use client";

import { MessageCircleOff } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { ConversationItem } from "./ConversationItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationList() {
  const { data, isPending, isError, refetch } = useConversations();

  if (isPending) return <ListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        className="flex-1"
        message="Couldn't load your conversations."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        className="flex-1"
        icon={<MessageCircleOff />}
        title="No conversations yet"
        description="Search for someone by name to start your first chat."
      />
    );
  }

  return (
    <ul role="list" className="flex flex-col gap-0.5 p-2">
      {data.map((conversation) => (
        <li key={conversation._id}>
          <ConversationItem conversation={conversation} />
        </li>
      ))}
    </ul>
  );
}
