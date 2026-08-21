"use client";

import { MessageCircle } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppPage() {
  return (
    <RequireAuth>
      <AppShell sidebar={<Sidebar />}>
        <EmptyState
          className="h-full"
          icon={<MessageCircle />}
          title="Select a conversation"
          description="Pick a chat from the list, or search for someone to start a new conversation."
        />
      </AppShell>
    </RequireAuth>
  );
}
