"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";

/**
 * Login-page guard: an already-authenticated visitor never sees the form —
 * straight to /app. A dead token resolves to "unauthenticated" (the session
 * hook clears it), so the user correctly stays here.
 */
export function RedirectIfAuthed() {
  const status = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/app");
  }, [status, router]);

  return null;
}
