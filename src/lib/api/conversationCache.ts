import type { Conversation } from "@/types/api";

/** Insert-or-replace by id, list kept sorted newest-activity-first. */
export function upsertConversation(
  list: Conversation[],
  entity: Conversation,
): Conversation[] {
  const rest = list.filter((c) => c._id !== entity._id);
  return [entity, ...rest].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function removeConversation(
  list: Conversation[],
  conversationId: string,
): Conversation[] {
  return list.filter((c) => c._id !== conversationId);
}
