import { RequireAuth } from "@/components/auth/RequireAuth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function AppPage() {
  return (
    <RequireAuth>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Workspace
        </h1>
        <p className="text-sm text-muted">
          The chat shell lands in Phase 5.
        </p>
        <LogoutButton />
      </main>
    </RequireAuth>
  );
}
