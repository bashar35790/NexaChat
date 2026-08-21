import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppPage() {
  return (
    <RequireAuth>
      <AppShell sidebar={<Sidebar />}>
        <ChatPanel />
      </AppShell>
    </RequireAuth>
  );
}
