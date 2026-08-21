"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";

/**
 * AUTH SESSION ONLY — hard ownership rule (plan §3): this store holds the
 * JWT + identity pair and nothing else. All server data lives exclusively in
 * TanStack Query caches.
 */
interface AuthState {
  token: string | null;
  user: User | null;
  /** Called once on successful login (or session restore). */
  setSession: (session: { token: string; user: User }) => void;
  /** Patches identity fields only (e.g. server-side rename on re-login). */
  setUser: (user: User) => void;
  /** Wipes the session — logout or force-logout on dead token. */
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "nexachat.auth",
    },
  ),
);

export const selectIsAuthenticated = (state: AuthState): boolean =>
  Boolean(state.token);
