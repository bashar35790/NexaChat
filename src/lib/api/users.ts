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
 * Raw endpoint search: case-sensitive name-prefix search on the server.
 */
export function searchUsers(q: string): Promise<User[]> {
  const sanitized = sanitizeSearchQuery(q);
  return request<User[]>("/users/search", { query: { q: sanitized } });
}

/**
 * Resilient multi-strategy search that supports both name and phone number search,
 * case-insensitivity, and substring matching while shielding against server 500 crashes.
 */
export async function searchUsersMulti(rawQuery: string): Promise<User[]> {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  const sanitized = sanitizeSearchQuery(trimmed);
  const lowerQ = trimmed.toLowerCase();
  const digitsQ = trimmed.replace(/\D/g, "");

  // Try direct server search with the sanitized term
  const serverResultsPromise = sanitized
    ? searchUsers(sanitized).catch(() => [] as User[])
    : Promise.resolve([] as User[]);

  // If capitalized version is different (e.g. "ada" vs "Ada"), also try capitalized
  const capitalized =
    sanitized.length > 0
      ? sanitized.charAt(0).toUpperCase() + sanitized.slice(1)
      : "";
  const capResultsPromise =
    capitalized && capitalized !== sanitized
      ? searchUsers(capitalized).catch(() => [] as User[])
      : Promise.resolve([] as User[]);

  // Directory dump fallback for phone or substring matching
  const directoryPromise =
    digitsQ.length >= 2 || sanitized.length >= 2
      ? searchUsers("").catch(() => [] as User[])
      : Promise.resolve([] as User[]);

  const [direct, cap, directory] = await Promise.all([
    serverResultsPromise,
    capResultsPromise,
    directoryPromise,
  ]);

  const map = new Map<string, User>();

  // Add direct & capitalized server matches
  for (const user of [...direct, ...cap]) {
    if (user && user._id) map.set(user._id, user);
  }

  // Filter directory by name (case-insensitive substring) and phone (digits match)
  for (const user of directory) {
    if (!user || !user._id) continue;
    const nameMatch = user.name && user.name.toLowerCase().includes(lowerQ);
    const phoneDigits = (user.phone || "").replace(/\D/g, "");
    const phoneMatch = digitsQ.length >= 2 && phoneDigits.includes(digitsQ);
    const phoneRawMatch =
      user.phone && user.phone.toLowerCase().includes(lowerQ);

    if (nameMatch || phoneMatch || phoneRawMatch) {
      map.set(user._id, user);
    }
  }

  return Array.from(map.values());
}

