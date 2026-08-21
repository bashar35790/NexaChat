"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDirectConversation } from "@/lib/api/conversations";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Conversation, User } from "@/types/api";

/**
 * Starts (or reopens) a DM and patches the list cache directly ,no refetch.
 * The server dedupes by returning the SAME _id for repeat calls, so an
 * existing cache entry is kept as-is; a brand-new conversation is synthesized
 * from the search-result user, whose enriched profile we already hold.
 */
export function useStartDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: User) => createDirectConversation(user._id),
    onSuccess: (created, user) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations(),
        (old) => {
          if (!old) return old;
          if (old.some((c) => c._id === created._id)) return old;
          const fresh: Conversation = {
            _id: created._id,
            type: "direct",
            participant: user,
            updatedAt: created.createdAt,
          };
          return [fresh, ...old];
        },
      );
    },
  });
}
