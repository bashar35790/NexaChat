import type { Message, MessagePage } from "@/types/api";
import { ApiError, request } from "./client";

/**
 * Page size pinned client-side: the API treats `limit=0` as "use default 20"
 * instead of an error (ISSUES.md #12), so we never send it and always control
 * pagination deterministically.
 */
export const MESSAGE_PAGE_SIZE = 20;

export interface HistoryParams {
  /** Cursor = `_id` of the oldest already-loaded message (inclusive server-side). */
  before?: string;
  limit?: number;
}

/**
 * Newest-first cursor pages. ⚠️ The `before` cursor is INCLUSIVE ,the boundary
 * message re-appears at the top of the next page, so cache prepends must
 * dedupe by id (ISSUES.md #11/#12).
 */
export function fetchMessageHistory(
  conversationId: string,
  params: HistoryParams = {},
): Promise<MessagePage> {
  return request<MessagePage>(`/conversations/${conversationId}/messages`, {
    query: {
      limit: params.limit ?? MESSAGE_PAGE_SIZE,
      before: params.before,
    },
  });
}

export interface SendMessagePayload {
  conversationId: string;
  text: string;
}

/**
 * Returns the full created message entity ,required for replacing optimistic
 * temp bubbles by server id. ⚠️ A nonexistent conversation answers HTTP 200
 * with body `null`; we normalize that silent failure into a thrown ApiError so
 * mutation onError paths stay uniform (ISSUES.md #9).
 */
export async function sendMessage(
  payload: SendMessagePayload,
): Promise<Message> {
  const message = await request<Message | null>("/messages", {
    method: "POST",
    body: payload,
  });
  if (!message) {
    throw new ApiError(
      "Message could not be delivered ,conversation not found.",
      200,
      "NOT_FOUND",
    );
  }
  return message;
}
