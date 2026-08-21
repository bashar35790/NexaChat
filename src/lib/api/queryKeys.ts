/**
 * Central query-key factory — the ONLY place raw key arrays are constructed,
 * so cache invalidation/patching (socket events, optimistic sends) can target
 * data precisely. Shapes: [conversations], [messages, id, cursor], [users, q].
 * The pagination cursor lives in useInfiniteQuery's pageParam, not the key.
 */
export const queryKeys = {
  conversations: () => ["conversations"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  users: (q: string) => ["users", q] as const,
};
