import Link from "next/link";
import { MessageCircle, LogIn } from "lucide-react";

/** Landing top bar: brand mark + sign-in entry point. */
export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-violet shadow-glow">
            <MessageCircle className="size-5 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            NexaChat
          </span>
        </Link>

        <Link
          href="/login"
          className="group relative flex h-12 w-32 select-none items-center justify-center rounded-[15px] p-0.5 transition-all duration-300 ease-out bg-[rgba(99,102,241,0.25)] bg-[linear-gradient(to_bottom_right,rgba(99,102,241,1)_0%,rgba(99,102,241,0)_35%)] hover:bg-[rgba(99,102,241,0.75)] hover:shadow-[0_0_14px_rgba(99,102,241,0.55)] focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <span className="flex h-full w-full items-center justify-center gap-2 rounded-[13px] bg-surface text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-raised">
            <LogIn className="size-4 text-white" aria-hidden="true" />
            Sign in
          </span>
        </Link>
      </nav>
    </header>
  );
}

