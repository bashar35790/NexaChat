"use client";

import { MessageCircle } from "lucide-react";
import { LoginForm } from "./LoginForm";

/**
 * Glass form panel. The real authenticate flow (API → store → redirect)
 * lands in the next commit; the no-op keeps the UI shippable until then.
 */
export function LoginCard() {
  return (
    <div className="relative z-10 w-full max-w-md rounded-panel border border-line bg-surface/60 p-7 shadow-panel backdrop-blur-xl sm:p-9">
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-glow">
          <MessageCircle className="h-5 w-5 text-white" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          NexaChat
        </span>
      </div>

      <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
        Sign in to chat
      </h2>
      <p className="mt-1.5 mb-7 text-sm text-muted">
        Your phone number is all it takes.
      </p>

      <LoginForm onAuthenticate={async () => {}} />
    </div>
  );
}
