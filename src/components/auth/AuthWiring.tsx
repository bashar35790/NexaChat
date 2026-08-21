"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  setForceLogoutHandler,
  setTokenProvider,
} from "@/lib/api/client";
import { teardownSession } from "@/lib/auth/teardown";
import { useAuthStore } from "@/stores/authStore";

/**
 * Boots the API client's auth wiring exactly once per app load:
 * - token provider: every request reads the live session token;
 * - force-logout: invoked (single-flight, loop-safe — see client.ts) whenever
 *   any request dies with {400 NO_TOKEN | 401 INVALID_TOKEN}.
 */
export function AuthWiring() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setTokenProvider(() => useAuthStore.getState().token);

    setForceLogoutHandler(() => {
      teardownSession(queryClient);
      router.replace("/login");
    });
  }, [router, queryClient]);

  return null;
}
