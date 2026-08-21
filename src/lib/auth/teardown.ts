import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { disconnectSocket } from "@/lib/socket";

/**
 * Identity-scoped teardown shared by explicit logout AND forced logout on a
 * dead token: kill the socket FIRST so no late events for the old identity
 * touch fresh caches, wipe the session pair, then wipe ALL TanStack Query
 * caches so the previous account's server data can never leak into the next.
 */
export async function teardownSession(queryClient: QueryClient): Promise<void> {
  await disconnectSocket();
  useAuthStore.getState().clear();
  queryClient.clear();
}
