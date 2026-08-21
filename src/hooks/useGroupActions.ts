"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGroupParticipants,
  promoteToAdmin,
  removeGroupParticipant,
  renameGroup,
} from "@/lib/api/groups";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  removeConversation,
  upsertConversation,
} from "@/lib/api/conversationCache";
import { useAuthStore } from "@/stores/authStore";
import type { Conversation, GroupConversation } from "@/types/api";

/**
 * All group mutations answer with the FULL refreshed entity — every hook
 * patches the conversations cache directly from the response (no refetch).
 * Permission failures (403) surface to callers as thrown errors → toast.
 */
function useEntityPatchingMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<GroupConversation>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (entity) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations(),
        (old) => (old ? upsertConversation(old, entity) : old),
      );
    },
  });
}

export function useRenameGroup() {
  return useEntityPatchingMutation((vars: { conversationId: string; name: string }) =>
    renameGroup(vars.conversationId, vars.name),
  );
}

export function useAddParticipants() {
  return useEntityPatchingMutation((vars: { conversationId: string; userIds: string[] }) =>
    addGroupParticipants(vars.conversationId, vars.userIds),
  );
}

export function useRemoveParticipant() {
  return useEntityPatchingMutation((vars: { conversationId: string; userId: string }) =>
    removeGroupParticipant(vars.conversationId, vars.userId),
  );
}

export function usePromoteAdmin() {
  return useEntityPatchingMutation((vars: { conversationId: string; userId: string }) =>
    promoteToAdmin(vars.conversationId, vars.userId),
  );
}

/**
 * Leaving = DELETE with your own id (any member may leave; a departing sole
 * admin auto-transfers server-side). Post-leave cleanup: the returned entity
 * no longer includes ME, so drop the conversation AND its messages cache.
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      removeGroupParticipant(
        conversationId,
        useAuthStore.getState().user?._id ?? "",
      ),
    onSuccess: (_entity, conversationId) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations(),
        (old) => (old ? removeConversation(old, conversationId) : old),
      );
      queryClient.removeQueries({ queryKey: queryKeys.messages(conversationId) });
    },
  });
}
