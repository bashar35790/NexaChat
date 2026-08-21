import type { Conversation, CreatedDirectConversation } from "@/types/api";
import { request } from "./client";

/** Envelope is `{data: Conversation[]}` ,NOT bare array (ISSUES.md #12). */
export async function listConversations(): Promise<Conversation[]> {
  const body = await request<{ data?: Conversation[] }>("/conversations");
  return body.data ?? [];
}

/**
 * Starts (or reopens) a direct conversation; server dedupes by returning the
 * SAME `_id` for repeat calls with the same userId. Response carries bare
 * participant id strings ,callers must refetch/patch to get enriched users.
 */
export function createDirectConversation(userId: string): Promise<CreatedDirectConversation> {
  return request<CreatedDirectConversation>("/conversations", {
    method: "POST",
    body: { userId },
  });
}
