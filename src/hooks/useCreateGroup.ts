"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "@/lib/api/groups";
import { queryKeys } from "@/lib/api/queryKeys";
import { upsertConversation } from "@/lib/api/conversationCache";
import type { Conversation, GroupConversation } from "@/types/api";

/** Creates the group and upserts the returned entity into the list cache. */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; participantIds: string[] }) =>
      createGroup(payload),

    onSuccess: (group: GroupConversation) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations(),
        (old) => (old ? upsertConversation(old, group) : [group]),
      );
    },
  });
}
