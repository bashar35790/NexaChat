"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  LogOut,
  MessageSquarePlus,
  MessagesSquare,
  Search,
  Users,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useUiStore } from "@/stores/uiStore";
import { useConversations } from "@/hooks/useConversations";
import { useUserSearch, MIN_QUERY_LENGTH } from "@/hooks/useUserSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStartDirectConversation } from "@/hooks/useStartDirectConversation";
import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/stores/authStore";
import { fuzzyScore } from "@/lib/utils/fuzzy";
import type { Conversation, User } from "@/types/api";

const DEBOUNCE_MS = 250;

interface CommandItem {
  key: string;
  section: "Conversations" | "People" | "Actions";
  label: string;
  hint?: string;
  icon: React.ReactNode;
  perform: () => void;
}

/**
 * ⌘K quick switcher (plan §10): fuzzy-jump to any conversation or person,
 * plus app actions. The global shortcut lives here ,the palette is mounted
 * once inside the authenticated tree. People results come from the live
 * directory search once the query is long enough; everything else filters
 * locally by subsequence score.
 */
export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setGroupWizardOpen = useUiStore((s) => s.setGroupWizardOpen);
  const openConversation = useUiStore((s) => s.openConversation);
  const logout = useLogout();
  const toast = useToast();
  const meId = useAuthStore((s) => s.user?._id);

  const [rawQuery, setRawQuery] = useState("");
  const query = rawQuery.trim();
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);

  const { data: conversations } = useConversations();
  const peopleQuery = useUserSearch(debounced);
  const startDm = useStartDirectConversation();

  const activeRef = useRef<HTMLButtonElement>(null);

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const store = useUiStore.getState();
        store.setPaletteOpen(!store.paletteOpen);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset the query whenever the palette opens/closes (derived-state pattern).
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setRawQuery("");
  }

  const handlePickPerson = useCallback(
    async (user: User) => {
      setOpen(false);
      try {
        const created = await startDm.mutateAsync(user);
        openConversation(created._id);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? `Couldn't start the conversation: ${error.message}`
            : "Couldn't start the conversation.",
        );
      }
    },
    [openConversation, setOpen, startDm, toast],
  );

  const actions: CommandItem[] = useMemo(
    () => [
      {
        key: "action-new-chat",
        section: "Actions",
        label: "Start a new conversation",
        hint: "search people",
        icon: <MessageSquarePlus className="size-4" aria-hidden="true" />,
        perform: () => {
          setOpen(false);
          setSearchOpen(true);
        },
      },
      {
        key: "action-new-group",
        section: "Actions",
        label: "Create a group",
        hint: "3+ members",
        icon: <Users className="size-4" aria-hidden="true" />,
        perform: () => {
          setOpen(false);
          setGroupWizardOpen(true);
        },
      },
      {
        key: "action-sign-out",
        section: "Actions",
        label: "Sign out",
        icon: <LogOut className="size-4" aria-hidden="true" />,
        perform: () => {
          setOpen(false);
          logout();
          router.replace("/login");
        },
      },
    ],
    [logout, router, setGroupWizardOpen, setOpen, setSearchOpen],
  );

  const filteredConversations = useMemo(() => {
    return scored(conversations ?? [], query, (conversation) =>
      conversationTitle(conversation),
    )
      .slice(0, 6)
      .map(({ entry }) => ({
        key: `conv-${entry._id}`,
        section: "Conversations" as const,
        label: conversationTitle(entry),
        hint:
          entry.type === "group"
            ? `${entry.participants.length} members`
            : undefined,
        icon: (
          <MessagesSquare
            className="size-4 shrink-0 text-faint"
            aria-hidden="true"
          />
        ),
        perform: () => {
          setOpen(false);
          openConversation(entry._id);
        },
      }));
  }, [conversations, openConversation, setOpen, query]);

  const peopleItems: CommandItem[] = useMemo(() => {
    if (!query) return [];
    // Directory search includes the caller ,hide yourself from "People".
    return (peopleQuery.data ?? [])
      .filter((user) => user._id !== meId)
      .slice(0, 4)
      .map((user) => ({
        key: `user-${user._id}`,
        section: "People" as const,
        label: user.name,
        hint: user.phone,
        icon: <Avatar id={user._id} name={user.name} size="xs" />,
        perform: () => void handlePickPerson(user),
      }));
  }, [handlePickPerson, meId, peopleQuery.data, query]);

  const sections: Array<{ name: CommandItem["section"]; items: CommandItem[] }> =
    [
      { name: "Conversations", items: filteredConversations },
      {
        name: "People",
        items:
          query.length >= MIN_QUERY_LENGTH && !peopleQuery.isError
            ? peopleItems
            : [],
      },
      { name: "Actions", items: filterByScore(actions, query) },
    ];
  const flat = sections.flatMap((section) => section.items);

  // Highlight resets whenever the query changes ,derived-state-during-render
  // (the sanctioned alternative to a setState-in-effect reset).
  const [highlight, setHighlight] = useState({ index: 0, query: "" });
  if (highlight.query !== rawQuery) {
    setHighlight({ index: 0, query: rawQuery });
  }
  const activeIndex = Math.min(highlight.index, Math.max(0, flat.length - 1));

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function move(delta: number) {
    if (flat.length === 0) return;
    setHighlight({
      index: (activeIndex + delta + flat.length) % flat.length,
      query: rawQuery,
    });
  }

  function runActive() {
    const item = flat[activeIndex];
    if (item) item.perform();
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Quick switcher"
      className="max-w-xl"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint"
          aria-hidden="true"
        />
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls="command-palette-list"
          aria-activedescendant={
            flat[activeIndex] ? `command-item-${activeIndex}` : undefined
          }
          aria-label="Search conversations, people, and actions"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              move(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              move(-1);
            } else if (e.key === "Enter") {
              e.preventDefault();
              runActive();
            }
          }}
          placeholder="Jump to a conversation, person, or action…"
          autoFocus
          autoComplete="off"
          className="h-12 w-full rounded-xl bg-raised pl-10 pr-4 text-sm text-fg ring-1 ring-line transition-shadow placeholder:text-faint hover:ring-line-strong focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div
        id="command-palette-list"
        role="listbox"
        aria-label="Command results"
        className="mt-3 max-h-80 min-h-32 overflow-y-auto"
      >
        {flat.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-faint">
            {query.length > 0 && query.length < MIN_QUERY_LENGTH
              ? "Keep typing to search people…"
              : query
                ? "Nothing matches that."
                : "Type to jump anywhere ,or pick an action below."}
          </p>
        ) : (
          sections.map((section) =>
            section.items.length === 0 ? null : (
              <div key={section.name} className="mb-1">
                <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                  {section.name}
                </p>
                {section.items.map((item) => {
                  const index = flat.indexOf(item);
                  const active = index === activeIndex;
                  return (
                    <button
                      key={item.key}
                      ref={active ? activeRef : undefined}
                      id={`command-item-${index}`}
                      role="option"
                      aria-selected={active}
                      type="button"
                      onMouseEnter={() => setHighlight({ index, query: rawQuery })}
                      onClick={item.perform}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                        active ? "bg-primary-soft" : "hover:bg-raised"
                      }`}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-raised ring-1 ring-line">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                        {item.label}
                      </span>
                      {item.hint ? (
                        <span className="shrink-0 text-xs text-faint">
                          {item.hint}
                        </span>
                      ) : null}
                      {active ? (
                        <CornerDownLeft
                          className="size-3.5 shrink-0 text-faint"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ),
          )
        )}
      </div>

      <p className="mt-2 border-t border-line pt-2 text-[11px] text-faint">
        <kbd className="rounded bg-raised px-1.5 py-0.5 font-sans ring-1 ring-line">
          ↑↓
        </kbd>{" "}
        navigate ·{" "}
        <kbd className="rounded bg-raised px-1.5 py-0.5 font-sans ring-1 ring-line">
          ↵
        </kbd>{" "}
        select ·{" "}
        <kbd className="rounded bg-raised px-1.5 py-0.5 font-sans ring-1 ring-line">
          esc
        </kbd>{" "}
        close
      </p>
    </Modal>
  );
}

function conversationTitle(conversation: Conversation): string {
  return conversation.type === "direct"
    ? conversation.participant.name
    : conversation.name;
}

function scored<T>(
  entries: T[],
  query: string,
  getText: (entry: T) => string,
): Array<{ entry: T; score: number }> {
  return entries
    .map((entry) => ({ entry, score: fuzzyScore(query, getText(entry)) }))
    .filter(
      (scoredEntry): scoredEntry is { entry: T; score: number } =>
        scoredEntry.score !== null,
    )
    .sort((a, b) => b.score - a.score);
}

function filterByScore(items: CommandItem[], query: string): CommandItem[] {
  return scored(items, query, (item) => item.label).map(
    (scoredItem) => scoredItem.entry,
  );
}
