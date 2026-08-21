"use client";

import { useQuery } from "@tanstack/react-query";
import { listConversations } from "@/lib/api/conversations";
import { queryKeys } from "@/lib/api/queryKeys";

/** All conversations, newest-activity-first (server-sorted by updatedAt). */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: listConversations,
  });
}
