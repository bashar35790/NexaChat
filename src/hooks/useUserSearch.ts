"use client";
 
import { useQuery } from "@tanstack/react-query";
import { searchUsersMulti } from "@/lib/api/users";
import { queryKeys } from "@/lib/api/queryKeys";

/**
 * Server quirk guards (ISSUES.md #5–7): empty `q` dumps the whole directory,
 * and short queries mostly miss — so we never fire below MIN_QUERY_LENGTH.
 * Results are case-insensitive name and phone matches, filtered client-side.
 */
export const MIN_QUERY_LENGTH = 2;

export function useUserSearch(query: string) {
  const q = query.trim();

  return useQuery({
    queryKey: queryKeys.users(q),
    queryFn: () => searchUsersMulti(q),
    enabled: q.length >= MIN_QUERY_LENGTH,
    // Keep the previous page visible while typing — no flicker between keys.
    placeholderData: (previous) => previous,
  });
}

