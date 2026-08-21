import Image from "next/image";
import { BadgeCheck, MessageCircleHeart, Star } from "lucide-react";
import { Reveal } from "./Reveal";

const AVATAR_PARAMS = "?auto=format&fit=crop&w=160&h=160&q=80&crop=faces";

const TESTIMONIALS = [
  {
    quote:
      "NexaChat feels less like software and more like a well-run room. Messages simply arrive — my team stopped noticing the tool, which is the highest praise I can give.",
    name: "Amelia Hart",
    role: "Product Lead · Lumen Studio",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    quote:
      "The reconnect healing is quietly brilliant. We work through terrible conference Wi-Fi all day and not one message has ever gone missing.",
    name: "Daniel Reyes",
    role: "Engineering Manager · Northwind",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
  {
    quote:
      "Search is instant and effortless — type two letters and the right person appears. It has quietly set a bar our other tools now fail to meet.",
    name: "Sofia Laurent",
    role: "Design Director · Atelier Nord",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  },
  {
    quote:
      "We replaced three tools with NexaChat. Groups are effortless to administer, and the interface carries that rare, considered quality you only get from real craft.",
    name: "Marcus Bennett",
    role: "Founder · Driftboard",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  },
  {
    quote:
      "Onboarding is a phone number and a name. Our entire community migrated in an afternoon — nobody needed a single tutorial.",
    name: "Clara Whitmore",
    role: "Community Lead · Fern & Co",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  },
  {
    quote:
      "It is fast in the way luxury things are fast: no spinners, no waiting, no ceremony. Just conversations, exactly as they happen.",
    name: "James Okafor",
    role: "CTO · Relay HQ",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
] as const;

function Stars({ className = "size-3.5" }: { className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} fill-warning text-warning`} />
      ))}
    </span>
  );
}

/** Testimonial wall: six reviews with Unsplash portraits on glass cards. */
export function Testimonials() {
  return (
    <section
      id="reviews"
      aria-label="What people say about NexaChat"
      className="relative overflow-hidden border-y border-line/60"
    >
      {/* aurora glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[44rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-linear-to-br from-violet/15 via-primary/10 to-transparent blur-[140px]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent ring-1 ring-primary/25">
            <MessageCircleHeart className="size-3.5" aria-hidden="true" />
            Loved by teams everywhere
          </p>
          <h2 className="mt-4 font-display font-bold tracking-tight text-white [font-size:clamp(2rem,3vw+1rem,3.25rem)] [text-wrap:balance]">
            Voices that speak{" "}
            <span className="bg-linear-to-r from-primary via-violet to-accent bg-clip-text text-transparent">
              for themselves.
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted [text-wrap:pretty]">
            From two-person studios to global crews — here is what people say
            after switching their conversations to NexaChat.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-line bg-surface/60 px-4 py-2 backdrop-blur">
            <Stars className="size-3" />
            <span className="text-xs font-medium text-muted">
              <span className="font-semibold text-white">4.9 / 5</span> from
              2,400+ verified reviews
            </span>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((review, index) => (
            <Reveal key={review.name} delay={(index % 3) * 0.12}>
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(99,102,241,0.18)]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 right-4 select-none font-display text-7xl leading-none text-white/[0.04]"
                >
                  &rdquo;
                </span>

                <Stars />

                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-line/60 pt-5">
                  <span className="relative shrink-0">
                    <span
                      aria-hidden="true"
                      className="absolute -inset-0.5 rounded-full bg-linear-to-br from-primary via-violet to-accent opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-90"
                    />
                    <Image
                      src={`${review.avatar}${AVATAR_PARAMS}`}
                      alt=""
                      width={88}
                      height={88}
                      loading="lazy"
                      className="relative size-11 rounded-full object-cover ring-2 ring-surface"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      {review.name}
                      <BadgeCheck
                        className="size-3.5 shrink-0 text-accent"
                        aria-label="Verified reviewer"
                      />
                    </span>
                    <span className="block truncate text-xs text-faint">
                      {review.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
