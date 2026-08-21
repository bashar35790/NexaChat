import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "./Reveal";

/** Closing call-to-action band with a quiet echo of the aurora. */
export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-line/60 bg-gradient-to-b from-transparent via-surface/40 to-base">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-violet/15 to-transparent blur-[140px]"
      />
      <Reveal className="mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-8 lg:py-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent ring-1 ring-primary/25">
          <Zap className="size-3.5" aria-hidden="true" />
          Instant Access
        </span>
        <h2 className="mt-6 font-display font-bold tracking-tight text-white [font-size:clamp(2.25rem,4vw+1rem,3.75rem)] [text-wrap:balance]">
          Ready to experience conversations at the speed of thought?
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted [text-wrap:pretty]">
          No sign-up form, no email confirmations. Drop your phone number, set a display name, and start chatting immediately.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex h-14 select-none items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-violet to-accent px-8 text-base font-bold text-white shadow-glow transition-all duration-300 hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Launch NexaChat Now
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/80 pt-16 pb-8 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 pb-12 border-b border-line/60">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-glow">
                <MessageCircle className="size-5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                NexaChat
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-muted max-w-xs">
              A high-performance real-time chat platform engineered with Next.js 16, React 19, Socket.IO, and TanStack Query.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success ring-1 ring-success/20">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/app" className="transition-colors hover:text-white">
                  Open Workspace
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Sign In / Auto Register
                </Link>
              </li>
              <li>
                <a href="#features" className="transition-colors hover:text-white">
                  Features Overview
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-white">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>Next.js 16 (App Router)</li>
              <li>React 19 & TypeScript</li>
              <li>Socket.IO Realtime Engine</li>
              <li>TanStack Query v5 Caching</li>
              <li>Tailwind CSS v4 Dark Aurora</li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Highlights
            </h4>
            <div className="rounded-2xl border border-line bg-raised/50 p-4 space-y-2 text-xs text-muted">
              <p className="flex items-center gap-2 text-white font-semibold">
                <ShieldCheck className="size-4 text-accent" />
                Resilient Realtime
              </p>
              <p className="text-[11px] leading-relaxed">
                Optimistic updates, reconnect gap healing, and permission-gated group administration.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-faint">
          <p>© 2026 NexaChat. Designed & built for take-home engineering evaluation.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="transition-colors hover:text-white">
              Launch App
            </Link>
            <span>·</span>
            <a href="#features" className="transition-colors hover:text-white">
              Back to Top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

