import type { GroupConversation } from "@/types/api";
import { request } from "./client";

/*
 * Every group mutation returns the FULL refreshed entity (probing-notes §groups),
 * so callers can patch query caches directly without refetching.
 */

/** Server enforces ≥3 TOTAL members (creator + ≥2 others) or VALIDATION_ERROR. */
export function createGroup(payload: {
  name: string;
  participantIds: string[];
}): Promise<GroupConversation> {
  return request<GroupConversation>("/conversations/group", {
    method: "POST",
    body: payload,
  });
}

/** Admins only (else 403 "Only admins can rename the group"). */
export function renameGroup(conversationId: string, name: string): Promise<GroupConversation> {
  return request<GroupConversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: { name },
  });
}

/** Admins only. Unknown userId currently crashes the server (500 — ISSUES.md #10). */
export function addGroupParticipants(
  conversationId: string,
  userIds: string[],
): Promise<GroupConversation> {
  return request<GroupConversation>(`/conversations/${conversationId}/participants`, {
    method: "POST",
    body: { userIds },
  });
}

/**
 * Removes a member (admins only). Passing your OWN id leaves the group — any
 * member may leave. A departing sole admin auto-transfers adminship server-side.
 */
export function removeGroupParticipant(
  conversationId: string,
  userId: string,
): Promise<GroupConversation> {
  return request<GroupConversation>(
    `/conversations/${conversationId}/participants/${userId}`,
    { method: "DELETE" },
  );
}

/** Admins only. Promoted member gains admin powers immediately. */
export function promoteToAdmin(
  conversationId: string,
  userId: string,
): Promise<GroupConversation> {
  return request<GroupConversation>(`/conversations/${conversationId}/admins`, {
    method: "POST",
    body: { userId },
  });
}
