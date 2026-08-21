"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MIN_QUERY_LENGTH, useUserSearch } from "@/hooks/useUserSearch";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types/api";

const DEBOUNCE_MS = 300;

export function UserSearchDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
}) {
  const meId = useAuthStore((s) => s.user?._id);
  const [rawQuery, setRawQuery] = useState("");
  const debounced = useDebouncedValue(rawQuery.trim(), DEBOUNCE_MS);
  const { data, isPending, isError, refetch } = useUserSearch(debounced);

  // The directory search includes the caller; DM-to-self is a server 400.
  const results = useMemo(
    () => (data ?? []).filter((user) => user._id !== meId),
    [data, meId],
  );
  const tooShort = debounced.length < MIN_QUERY_LENGTH;

  // Highlight auto-resets to 0 whenever the result set changes (derived from
  // the query it belongs to — no effect needed) and clamps to bounds.
  const [highlightState, setHighlightState] = useState({ q: "", index: 0 });
  const highlight =
    highlightState.q === debounced
      ? Math.min(highlightState.index, Math.max(0, results.length - 1))
      : 0;

  function moveHighlight(delta: number) {
    if (results.length === 0) return;
    setHighlightState({
      q: debounced,
      index: (highlight + delta + results.length) % results.length,
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const user = results[highlight];
      if (user) onSelect(user);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New conversation"
      className="max-w-lg"
    >
      <Input
        label="Find someone"
        placeholder="Name or phone number, e.g. Ada or +1555…"
        hint="Search by display name or phone number. At least 2 characters."
        value={rawQuery}
        onChange={(e) => setRawQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        leading={<Search className="size-4" aria-hidden="true" />}
        autoComplete="off"
      />

      <div
        role="listbox"
        aria-label="Search results"
        aria-activedescendant={
          results[highlight] ? `search-result-${highlight}` : undefined
        }
        className="mt-3 max-h-80 overflow-y-auto"
      >
        {tooShort ? (
          <p className="px-1 py-6 text-center text-sm text-faint">
            Type at least {MIN_QUERY_LENGTH} characters to search.
          </p>
        ) : isPending && results.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : isError ? (
          <ErrorState
            message="Search failed."
            onRetry={() => void refetch()}
            className="py-6"
          />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <SearchX className="size-6 text-faint" aria-hidden="true" />
            <p className="text-sm text-muted">
              No people found for “{debounced}”.
            </p>
          </div>
        ) : (
          <ul role="presentation" className="flex flex-col gap-0.5">
            {results.map((user, index) => (
              <li key={user._id}>
                <button
                  type="button"
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={index === highlight}
                  onClick={() => onSelect(user)}
                  onMouseEnter={() =>
                    setHighlightState({ q: debounced, index })
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    index === highlight ? "bg-primary-soft" : "hover:bg-raised"
                  }`}
                >
                  <Avatar id={user._id} name={user.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-faint">
                      {user.phone}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
