import type { User } from "@/types/api";
import { request } from "./client";

/**
 * Strips regex metacharacters before sending: a literal `+` crashes the
 * server's search regex with a raw Mongo 500 (ISSUES.md #6).
 */
export function sanitizeSearchQuery(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, "");
}

/**
 * Observed semantics: matches are case-sensitive NAME-PREFIX only; empty `q`
 * dumps the whole directory unpaginated (callers must enforce min length).
 * Results include the caller themselves.
 */
export function searchUsers(q: string): Promise<User[]> {
  return request<User[]>("/users/search", { query: { q } });
}
