import type { LoginResponse, User } from "@/types/api";
import { request } from "./client";

/**
 * Single endpoint handles signup AND login (upsert semantics): a new phone
 * registers, an existing phone logs in and silently adopts the given name
 * (ISSUES.md #4). No server-side phone validation exists ,enforce E.164-ish
 * format in the form layer before calling.
 */
export function login(payload: { phone: string; name: string }): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    // Never attach a stale token to credential exchange.
    auth: false,
  });
}

/** Session-restore probe: returns the user or throws {400 NO_TOKEN | 401 INVALID_TOKEN}. */
export function getMe(): Promise<User> {
  return request<User>("/auth/me");
}
