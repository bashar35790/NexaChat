"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthSession } from "@/hooks/useAuthSession";

function Splash() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-base"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet shadow-glow">
        <MessageCircle className="h-6 w-6 text-white" />
      </span>
      <Spinner />
    </div>
  );
}

/** Gate for authed-only trees: bounces anonymous visitors to /login. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // "restoring" also covers the dead-token redirect in flight ,never flash
  // protected content for either case.
  if (status !== "authenticated") return <Splash />;
  return <>{children}</>;
}
