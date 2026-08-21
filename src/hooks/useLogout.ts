"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { teardownSession } from "@/lib/auth/teardown";

/**
 * Explicit user logout. Order matters (plan §3): socket disconnect (Phase 7)
 * → clear session + server caches → redirect to /login.
 */
export function useLogout(): () => void {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(() => {
    void teardownSession(queryClient);
    router.replace("/login");
  }, [queryClient, router]);
}
