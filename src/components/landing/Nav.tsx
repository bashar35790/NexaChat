import Link from "next/link";
import { MessageCircle } from "lucide-react";

/** Landing top bar: brand mark + sign-in entry point. */
export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet shadow-glow">
            <MessageCircle className="size-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            NexaChat
          </span>
        </Link>

        <Link
          href="/login"
          className="inline-flex h-9 select-none items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
