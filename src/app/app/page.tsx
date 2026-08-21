import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { RealtimeBridge } from "@/components/realtime/RealtimeBridge";

export default function AppPage() {
  return (
    <RequireAuth>
      <RealtimeBridge />
      <AppShell sidebar={<Sidebar />}>
        <ChatPanel />
      </AppShell>
    </RequireAuth>
  );
}
