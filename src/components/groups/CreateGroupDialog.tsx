"use client";

import { useState } from "react";
import { ArrowLeft, Users, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { UserPicker } from "./UserPicker";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/types/api";

/** Server rule: a group needs ≥3 TOTAL members (creator + 2 others). */
const MIN_OTHERS = 2;

/**
 * Two-step creation wizard: pick members (search-backed chips) → name the
 * group → create. Server VALIDATION_ERROR details surface inline; the cache
 * upsert happens in the hook.
 */
export function CreateGroupDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (group: { _id: string }) => void;
}) {
  const [step, setStep] = useState<"members" | "name">("members");
  const [selected, setSelected] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const createGroup = useCreateGroup();

  function reset() {
    setStep("members");
    setSelected([]);
    setName("");
    setServerError(null);
  }

  function handleClose() {
    onClose();
    // Reset after close so the exit animation doesn't show a cleared form.
    setTimeout(reset, 200);
  }

  function toggleUser(user: User) {
    setServerError(null);
    setSelected((current) =>
      current.some((u) => u._id === user._id)
        ? current.filter((u) => u._id !== user._id)
        : [...current, user],
    );
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setServerError(null);
    try {
      const group = await createGroup.mutateAsync({
        name: trimmed,
        participantIds: selected.map((u) => u._id),
      });
      handleClose();
      onCreated(group);
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        setServerError(
          error.details.map((d) => d.message).join(" ") || error.message,
        );
      } else {
        setServerError(
          error instanceof Error ? error.message : "Couldn't create the group.",
        );
      }
    }
  }

  const enoughMembers = selected.length >= MIN_OTHERS;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === "members" ? "New group" : "Name your group"}
      className="max-w-lg"
    >
      {step === "members" ? (
        <>
          {selected.length > 0 ? (
            <ul
              aria-label="Selected members"
              className="mb-3 flex flex-wrap gap-1.5"
            >
              {selected.map((user) => (
                <li key={user._id}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft py-0.5 pl-0.5 pr-2 text-xs font-medium text-fg ring-1 ring-line">
                    <Avatar id={user._id} name={user.name} size="xs" />
                    <span className="max-w-32 truncate">{user.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleUser(user)}
                      aria-label={`Remove ${user.name}`}
                      className="rounded-full p-0.5 text-faint transition-colors hover:bg-raised hover:text-danger"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <UserPicker selectedIds={selected.map((u) => u._id)} onToggle={toggleUser} />

          <div className="mt-4 flex items-center justify-between gap-3">
            <p
              className={`text-xs ${enoughMembers ? "text-faint" : "text-warning"}`}
            >
              <Users className="mr-1 inline size-3.5 align-baseline" aria-hidden="true" />
              {enoughMembers
                ? `${selected.length + 1} members total`
                : `Add ${MIN_OTHERS - selected.length} more — groups need at least ${MIN_OTHERS + 1} members.`}
            </p>
            <Button
              size="sm"
              disabled={!enoughMembers}
              onClick={() => setStep("name")}
            >
              Continue
            </Button>
          </div>
        </>
      ) : (
        <>
          <Input
            label="Group name"
            placeholder="e.g. Design crew"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
            }}
            maxLength={64}
            autoFocus
          />
          <p className="mt-2 text-xs text-faint">
            {selected.length + 1} members: you,{" "}
            {selected.map((u) => u.name).join(", ")}
          </p>

          {serverError ? (
            <p role="alert" className="mt-2 text-xs text-danger">
              {serverError}
            </p>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setServerError(null);
                setStep("members");
              }}
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back
            </Button>
            <Button
              size="sm"
              loading={createGroup.isPending}
              disabled={!name.trim()}
              onClick={() => void handleCreate()}
            >
              Create group
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
