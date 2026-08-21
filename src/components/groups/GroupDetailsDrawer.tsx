"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Check,
  MoreVertical,
  Pencil,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserPicker } from "./UserPicker";
import {
  useAddParticipants,
  useLeaveGroup,
  usePromoteAdmin,
  useRemoveParticipant,
  useRenameGroup,
} from "@/hooks/useGroupActions";
import { useAuthStore } from "@/stores/authStore";
import type { GroupConversation, User } from "@/types/api";

/**
 * Right-side slide-over with the group's member roster plus admin management
 * actions (T8.2/T8.3): inline rename, add members, remove, promote. Admin
 * controls render ONLY for admins; server permission rules remain the source
 * of truth — violations surface as error toasts.
 */
export function GroupDetailsDrawer({
  conversation,
  mode = "details",
  onClose,
}: {
  conversation: GroupConversation;
  /** `leave` raises the destructive confirmation immediately. */
  mode?: "details" | "leave";
  onClose: () => void;
}) {
  const meId = useAuthStore((s) => s.user?._id);
  const toast = useToast();
  const closeRef = useRef<HTMLButtonElement>(null);

  const isAdmin = conversation.admins.includes(meId ?? "");

  // Admins first, then alphabetical — roles stay scannable.
  const members = useMemo(
    () =>
      [...conversation.participants].sort((a, b) => {
        const aAdmin = conversation.admins.includes(a._id) ? 0 : 1;
        const bAdmin = conversation.admins.includes(b._id) ? 0 : 1;
        return aAdmin !== bAdmin ? aAdmin - bAdmin : a.name.localeCompare(b.name);
      }),
    [conversation.participants, conversation.admins],
  );

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  /* ------------------------------ rename ------------------------------ */
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(conversation.name);
  const renameGroup = useRenameGroup();

  function beginRename() {
    setNameDraft(conversation.name);
    setEditingName(true);
  }

  async function handleRename() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === conversation.name) {
      setEditingName(false);
      return;
    }
    try {
      await renameGroup.mutateAsync({
        conversationId: conversation._id,
        name: trimmed,
      });
      setEditingName(false);
      toast.success("Group renamed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't rename the group.",
      );
    }
  }

  /* ---------------------------- add members --------------------------- */
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<User[]>([]);
  const addParticipants = useAddParticipants();

  async function handleAdd() {
    if (picked.length === 0) return;
    try {
      await addParticipants.mutateAsync({
        conversationId: conversation._id,
        userIds: picked.map((u) => u._id),
      });
      setAdding(false);
      setPicked([]);
      toast.success(
        picked.length === 1 ? "Member added." : `${picked.length} members added.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't add members.");
    }
  }

  /* ------------------------- remove / promote ------------------------- */
  const [removeTarget, setRemoveTarget] = useState<User | null>(null);
  const removeParticipant = useRemoveParticipant();

  async function handleRemove() {
    if (!removeTarget) return;
    try {
      await removeParticipant.mutateAsync({
        conversationId: conversation._id,
        userId: removeTarget._id,
      });
      toast.success(`${removeTarget.name} removed.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't remove the member.",
      );
    } finally {
      setRemoveTarget(null);
    }
  }

  const [promoteTarget, setPromoteTarget] = useState<User | null>(null);
  const promoteAdmin = usePromoteAdmin();

  async function handlePromote() {
    if (!promoteTarget) return;
    try {
      await promoteAdmin.mutateAsync({
        conversationId: conversation._id,
        userId: promoteTarget._id,
      });
      toast.success(`${promoteTarget.name} is now an admin.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't promote the member.",
      );
    } finally {
      setPromoteTarget(null);
    }
  }

  /* ------------------------------- leave ------------------------------ */
  const leaveGroup = useLeaveGroup();
  const [leaveOpen, setLeaveOpen] = useState(mode === "leave");

  async function handleLeave() {
    try {
      await leaveGroup.mutateAsync(conversation._id);
      onClose(); // selection vanishes from cache → ChatPanel shows empty pane
      toast.success("You left the group.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't leave the group.",
      );
    }
  }

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${conversation.name}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-pop ring-1 ring-line"
          >
            {/* Header + inline rename */}
            <div className="flex items-start gap-3 border-b border-line p-4">
              <Avatar id={conversation._id} name={conversation.name} size="md" />
              <div className="min-w-0 flex-1">
                {editingName ? (
                  <div className="flex items-center gap-1">
                    <Input
                      label="Group name"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleRename();
                        if (e.key === "Escape") {
                          setNameDraft(conversation.name);
                          setEditingName(false);
                        }
                      }}
                      maxLength={64}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => void handleRename()}
                      aria-label="Save name"
                      className="rounded-full p-1.5 text-success transition-colors hover:bg-raised"
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNameDraft(conversation.name);
                        setEditingName(false);
                      }}
                      aria-label="Cancel rename"
                      className="rounded-full p-1.5 text-faint transition-colors hover:bg-raised hover:text-fg"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate font-display text-base font-semibold tracking-tight">
                      {conversation.name}
                    </h2>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={beginRename}
                        aria-label="Rename group"
                        title="Rename group"
                        className="rounded-full p-1 text-faint transition-colors hover:bg-raised hover:text-fg"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                )}
                <p className="mt-0.5 text-xs text-faint">
                  {conversation.participants.length} members ·{" "}
                  {isAdmin ? "you're an admin" : "member"}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-full p-1.5 text-faint transition-colors hover:bg-raised hover:text-fg"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Roster */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              <ul className="flex flex-col">
                {members.map((member) => {
                  const isSelf = member._id === meId;
                  const memberIsAdmin = conversation.admins.includes(member._id);
                  // No demotion endpoint exists; self-management is the leave
                  // flow — so the menu only targets other regular members.
                  const actionable = isAdmin && !isSelf && !memberIsAdmin;
                  return (
                    <li
                      key={member._id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-raised"
                    >
                      <Avatar id={member._id} name={member.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">
                          {member.name}
                          {isSelf ? (
                            <span className="text-faint"> (you)</span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-faint">
                          {member.phone}
                        </p>
                      </div>
                      {memberIsAdmin ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-line">
                          <ShieldCheck className="size-3" aria-hidden="true" />
                          Admin
                        </span>
                      ) : null}
                      {actionable ? (
                        <DropdownMenu
                          label={`Actions for ${member.name}`}
                          align="end"
                          trigger={
                            <span className="block rounded-full p-1.5 text-faint transition-colors hover:bg-overlay hover:text-fg">
                              <MoreVertical
                                className="size-4"
                                aria-hidden="true"
                              />
                            </span>
                          }
                          items={[
                            {
                              label: "Promote to admin",
                              onSelect: () => setPromoteTarget(member),
                            },
                            {
                              label: "Remove from group",
                              danger: true,
                              onSelect: () => setRemoveTarget(member),
                            },
                          ]}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t border-line p-3">
              {isAdmin ? (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setPicked([]);
                    setAdding(true);
                  }}
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  Add members
                </Button>
              ) : null}
              <Button
                variant="danger"
                size="md"
                className="w-full"
                loading={leaveGroup.isPending}
                onClick={() => setLeaveOpen(true)}
              >
                Leave group
              </Button>
            </div>
          </motion.aside>
        </div>,
        document.body,
      )}

      {/* Add-members picker */}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add members"
        className="max-w-lg"
      >
        <UserPicker
          selectedIds={picked.map((u) => u._id)}
          excludeIds={conversation.participants.map((p) => p._id)}
          onToggle={(user) =>
            setPicked((current) =>
              current.some((u) => u._id === user._id)
                ? current.filter((u) => u._id !== user._id)
                : [...current, user],
            )
          }
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-faint">
            {picked.length > 0
              ? `${picked.length} selected`
              : "Pick at least one person."}
          </p>
          <Button
            size="sm"
            disabled={picked.length === 0}
            loading={addParticipants.isPending}
            onClick={() => void handleAdd()}
          >
            Add to group
          </Button>
        </div>
      </Modal>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void handleRemove()}
        loading={removeParticipant.isPending}
        danger
        title="Remove member?"
        body={`${removeTarget?.name ?? "This member"} will lose access to this group's messages.`}
        confirmLabel="Remove"
      />

      {/* Promote confirmation */}
      <ConfirmDialog
        open={Boolean(promoteTarget)}
        onClose={() => setPromoteTarget(null)}
        onConfirm={() => void handlePromote()}
        loading={promoteAdmin.isPending}
        title="Promote to admin?"
        body={`${promoteTarget?.name ?? "This member"} will be able to rename the group, manage members, and promote others.`}
        confirmLabel="Promote"
      />
      {/* Leave confirmation */}
      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={() => void handleLeave()}
        loading={leaveGroup.isPending}
        danger
        title="Leave this group?"
        body={
          isAdmin && conversation.admins.length === 1
            ? "You're the only admin — adminship will transfer to another member automatically."
            : "You'll lose access to this group's messages. You can only rejoin if an admin adds you back."
        }
        confirmLabel="Leave group"
      />
    </>
  );
}
