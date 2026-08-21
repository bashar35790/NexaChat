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
  /** User-search dialog visibility. */
  searchOpen: boolean;
  /** Group-creation wizard visibility (shared: sidebar button + ⌘K action). */
  groupWizardOpen: boolean;
  /** ⌘K command palette visibility. */
  paletteOpen: boolean;
  setActiveConversation: (id: string | null) => void;
  /** Selects a conversation AND flips the mobile pane to the chat side. */
  openConversation: (id: string) => void;
  setMobilePane: (pane: MobilePane) => void;
  setSearchOpen: (open: boolean) => void;
  setGroupWizardOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UIState>()((set) => ({
  activeConversationId: null,
  mobilePane: "list",
  searchOpen: false,
  groupWizardOpen: false,
  paletteOpen: false,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  openConversation: (id) =>
    set({ activeConversationId: id, mobilePane: "chat" }),
  setMobilePane: (pane) => set({ mobilePane: pane }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setGroupWizardOpen: (open) => set({ groupWizardOpen: open }),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}));
