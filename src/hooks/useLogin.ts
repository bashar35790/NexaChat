"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";

/**
 * Full login flow: POST /auth/login → persist {token, user} → enter /app.
 * Duplicate-phone semantics (probing T1.1): an existing number signs in and
 * its display name is silently updated server-side ,the returned user entity
 * (already renamed) is what lands in the store, keeping identity in sync.
 */
export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (values: { name: string; phone: string }) => {
      const { token, user } = await login(values);
      setSession({ token, user });
      return user;
    },
    onSuccess: () => {
      router.replace("/app");
    },
  });
}
