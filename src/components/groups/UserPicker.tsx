"use client";

import { useMemo, useState } from "react";
import { Check, Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MIN_QUERY_LENGTH, useUserSearch } from "@/hooks/useUserSearch";

const DEBOUNCE_MS = 300;

/**
 * Search-backed multi-select used by the create-group wizard and the
 * add-members flow. Selection lives with the parent; this component only
 * reports toggles.
 */
export function UserPicker({
  selectedIds,
  excludeIds = [],
  onToggle,
}: {
  selectedIds: string[];
  /** Ids hidden from results (e.g. people already in the group). */
  excludeIds?: string[];
  onToggle: (user: { _id: string; name: string; phone: string }) => void;
}) {
  const [rawQuery, setRawQuery] = useState("");
  const debounced = useDebouncedValue(rawQuery.trim(), DEBOUNCE_MS);
  const { data, isPending, isError, refetch } = useUserSearch(debounced);

  // Server matches are case-sensitive name-PREFIX only (ISSUES.md #5); regex
  // metachars crash it, but typed input is matched server-side so no escaping
  // is needed here. Directory dumps include the caller ,hide them plus
  // already-selected/excluded entries.
  const results = useMemo(
    () =>
      (data ?? []).filter(
        (user) =>
          !excludeIds.includes(user._id) && !selectedIds.includes(user._id),
      ),
    [data, excludeIds, selectedIds],
  );
  const tooShort = debounced.length < MIN_QUERY_LENGTH;

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
      if (user) onToggle(user);
    }
  }

  return (
    <>
      <Input
        label="Add people"
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
          results[highlight] ? `picker-result-${highlight}` : undefined
        }
        className="mt-3 max-h-56 overflow-y-auto"
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
                  id={`picker-result-${index}`}
                  role="option"
                  aria-selected={index === highlight}
                  onClick={() => onToggle(user)}
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
                  <Check
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
