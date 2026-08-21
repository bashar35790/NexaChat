import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { RealtimeBridge } from "@/components/realtime/RealtimeBridge";
import { ConnectionBanner } from "@/components/realtime/ConnectionBanner";

export default function AppPage() {
  return (
    <RequireAuth>
      <RealtimeBridge />
      <ConnectionBanner />
      <AppShell sidebar={<Sidebar />}>
        <ChatPanel />
      </AppShell>
    </RequireAuth>
  );
}
