import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

/**
 * Identity-scoped teardown shared by explicit logout AND forced logout on a
 * dead token: wipe the session pair, then wipe ALL TanStack Query caches so
 * the previous account's server data can never leak into the next session.
 * (Phase 7 inserts socket disconnect here, ahead of any state change.)
 */
export function teardownSession(queryClient: QueryClient): void {
  useAuthStore.getState().clear();
  queryClient.clear();
}
