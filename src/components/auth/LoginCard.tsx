"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { LoginForm } from "./LoginForm";

export function LoginCard() {
  const login = useLogin();

  return (
    <div className="relative z-10 w-full max-w-md rounded-panel border border-line bg-surface/60 p-7 shadow-panel backdrop-blur-xl sm:p-9">
      <Link
        href="/"
        className="mb-8 flex w-fit items-center gap-2.5 lg:hidden"
        title="Back to home page"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-glow">
          <MessageCircle className="h-5 w-5 text-white" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          NexaChat
        </span>
      </Link>

      <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
        Sign in to chat
      </h2>
      <p className="mt-1.5 mb-7 text-sm text-muted">
        Your phone number is all it takes.
      </p>

      <LoginForm onAuthenticate={(values) => login.mutateAsync(values)} />
    </div>
  );
}
