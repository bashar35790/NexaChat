import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AuroraCanvas } from "./AuroraCanvas";
import { ChatReplay } from "./ChatReplay";

const PRIMARY_CTA =
  "inline-flex h-12 select-none items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-violet px-6 text-base font-medium text-white shadow-glow transition-[filter] duration-150 hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const SECONDARY_CTA =
  "inline-flex h-12 select-none items-center justify-center gap-2 rounded-full px-6 text-base font-medium text-muted ring-1 ring-line-strong transition-colors hover:text-fg hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Landing hero: canvas aurora behind display typography, CTAs into the app,
 * and a product mockup frame (populated by the live replay widget in T9.2).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AuroraCanvas />
      {/* readability veil over the aurora */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-base/10 via-transparent to-base"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-5 pb-20 pt-32 sm:px-8 md:pt-40 lg:flex-row lg:items-center lg:gap-16 lg:pb-28">
        {/* Copy */}
        <div className="max-w-xl text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-muted ring-1 ring-line backdrop-blur">
            <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
            Real-time messaging, zero friction
          </p>

          <h1 className="mt-6 font-display font-semibold tracking-tight text-white [text-wrap:balance] [font-size:clamp(2.5rem,5.5vw+0.75rem,4.5rem)] [line-height:1.05]">
            Conversations at the{" "}
            <span className="bg-gradient-to-r from-primary via-violet to-accent bg-clip-text text-transparent">
              speed of thought.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted [text-wrap:pretty] lg:mx-0">
            NexaChat pairs a razor-sharp interface with live sockets, instant
            people search, and effortless groups — so nothing comes between you
            and the conversation.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/login" className={PRIMARY_CTA}>
              Start chatting
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#features" className={SECONDARY_CTA}>
              Explore features
            </a>
          </div>
        </div>

        {/* Product mockup */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-panel bg-gradient-to-br from-primary/25 via-violet/15 to-transparent blur-2xl"
          />
          <div className="relative rounded-panel bg-surface/90 shadow-pop ring-1 ring-line backdrop-blur">
            {/* mockup header */}
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <div className="flex -space-x-2">
                {["Ada", "Grace", "Linus"].map((name) => (
                  <span
                    key={name}
                    aria-hidden="true"
                    className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-overlay to-raised text-[9px] font-semibold text-muted ring-2 ring-surface"
                  >
                    {name.slice(0, 1)}
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Aurora Crew</p>
                <p className="text-xs text-faint">3 members</p>
              </div>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
            </div>
            {/* mockup body — live scripted replay (loops; static under reduced motion) */}
            <ChatReplay />
          </div>
        </div>
      </div>
    </section>
  );
}
