"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthWiring } from "@/components/auth/AuthWiring";
import { ApiError } from "@/lib/api/client";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Never retry 4xx (validation/auth/permission errors are terminal);
        // transport failures and 5xx get a short bounded retry.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.isClientError) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // useState lazy-init keeps one client per browser session (SSR-safe).
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWiring />
      {children}
    </QueryClientProvider>
  );
}
