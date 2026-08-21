"use client";

import { create } from "zustand";

export type MobilePane = "list" | "chat";

/**
 * UI STATE ONLY (plan §3 ownership rule): selection, pane switching, dialog
 * visibility. No server data ever lands here.
 */
interface UIState {
  /** Currently selected conversation id (null = none/chat placeholder). */
  activeConversationId: string | null;
  /** Single-pane switcher for <768px viewports. */
  mobilePane: MobilePane;
  setActiveConversation: (id: string | null) => void;
  /** Selects a conversation AND flips the mobile pane to the chat side. */
  openConversation: (id: string) => void;
  setMobilePane: (pane: MobilePane) => void;
}

export const useUiStore = create<UIState>()((set) => ({
  activeConversationId: null,
  mobilePane: "list",
  setActiveConversation: (id) => set({ activeConversationId: id }),
  openConversation: (id) =>
    set({ activeConversationId: id, mobilePane: "chat" }),
  setMobilePane: (pane) => set({ mobilePane: pane }),
}));
