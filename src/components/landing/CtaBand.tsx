import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

/** Closing call-to-action band with a quiet echo of the aurora. */
export function CtaBand() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]"
      />
      <Reveal className="mx-auto w-full max-w-3xl px-5 py-24 text-center sm:px-8 lg:py-32">
        <h2 className="font-display font-semibold tracking-tight [font-size:clamp(1.75rem,2.5vw+0.75rem,2.75rem)] [text-wrap:balance]">
          Ready when you are.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted [text-wrap:pretty]">
          Pick a name, pick a chat, and say something worth reading.
        </p>
        <Link
          href="/login"
          className="mt-9 inline-flex h-12 select-none items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-violet px-7 text-base font-medium text-white shadow-glow transition-[filter] duration-150 hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Launch NexaChat
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-faint sm:flex-row sm:px-8">
        <p>NexaChat — a take-home build, crafted end to end.</p>
        <p>
          <Link
            href="/login"
            className="rounded transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Sign in
          </Link>
          {" · "}
          <span>© 2026</span>
        </p>
      </div>
    </footer>
  );
}
