"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import type { GroupConversation } from "@/types/api";

/**
 * Right-side slide-over with the group's member roster (T8.2). Management
 * actions land in the following commits; server permission rules stay the
 * source of truth throughout.
 */
export function GroupDetailsDrawer({
  conversation,
  onClose,
}: {
  conversation: GroupConversation;
  onClose: () => void;
}) {
  const meId = useAuthStore((s) => s.user?._id);
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

  return createPortal(
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
        <div className="flex items-start gap-3 border-b border-line p-4">
          <Avatar id={conversation._id} name={conversation.name} size="md" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-base font-semibold tracking-tight">
              {conversation.name}
            </h2>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <ul className="flex flex-col">
            {members.map((member) => {
              const isSelf = member._id === meId;
              const memberIsAdmin = conversation.admins.includes(member._id);
              return (
                <li
                  key={member._id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-raised"
                >
                  <Avatar id={member._id} name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {member.name}
                      {isSelf ? <span className="text-faint"> (you)</span> : null}
                    </p>
                    <p className="truncate text-xs text-faint">{member.phone}</p>
                  </div>
                  {memberIsAdmin ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-line">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      Admin
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </motion.aside>
    </div>,
    document.body,
  );
}
