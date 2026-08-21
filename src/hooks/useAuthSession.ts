"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import { useAuthStore } from "@/stores/authStore";

export type SessionStatus = "restoring" | "authenticated" | "unauthenticated";

/**
 * Session lifecycle (plan §3): hydrate persisted store → validate token via
 * GET /auth/me → dead token clears the store and redirects to /login.
 *
 * Transient failures (network/5xx) do NOT kill the session ,the user stays
 * authenticated on their persisted token and inner screens render retryable
 * error states instead.
 */
export function useAuthSession(): SessionStatus {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  // Zustand persist rehydrates async from localStorage; gate validation on it
  // so a valid session is never mistaken for a missing one mid-hydration.
  // useSyncExternalStore keeps SSR (server snapshot: false → "restoring")
  // mismatch-free; on the server `window` is undefined, so zustand's persist
  // never even attaches its api ,the ?? true fallback covers that shape.
  const hydrated = useSyncExternalStore(
    (onStoreChange) => {
      const persistApi = useAuthStore.persist;
      if (!persistApi) return () => {};
      return persistApi.onFinishHydration(onStoreChange);
    },
    () => useAuthStore.persist?.hasHydrated() ?? true,
    () => false,
  );

  const meQuery = useQuery({
    queryKey: queryKeys.auth(),
    queryFn: getMe,
    enabled: hydrated && Boolean(token),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  const { data } = meQuery;
  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  const deadToken =
    meQuery.error instanceof ApiError && meQuery.error.isSessionDead;

  useEffect(() => {
    if (!deadToken) return;
    clear();
    router.replace("/login");
  }, [deadToken, clear, router]);

  if (!hydrated) return "restoring";
  if (!token) return "unauthenticated";
  if (meQuery.isPending || deadToken) return "restoring";
  return "authenticated";
}
