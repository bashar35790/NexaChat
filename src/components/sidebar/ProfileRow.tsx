"use client";

import { useAuthStore } from "@/stores/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { LogoutButton } from "@/components/auth/LogoutButton";

/** Sidebar header: identity (initials avatar + name/phone) and logout. */
export function ProfileRow() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4">
      <Avatar
        id={user?._id ?? "unknown"}
        name={user?.name ?? "?"}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">
          {user?.name ?? "Signed in"}
        </p>
        <p className="truncate text-xs text-faint">{user?.phone}</p>
      </div>
      <LogoutButton />
    </div>
  );
}
