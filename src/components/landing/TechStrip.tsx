import { Layers } from "lucide-react";
import { Reveal } from "./Reveal";

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "TanStack Query",
  "Zustand",
  "Socket.IO",
  "Framer Motion",
] as const;

const CHIP =
  "group flex h-11 shrink-0 select-none items-center gap-3 whitespace-nowrap rounded-full border border-line/80 bg-surface/60 pl-5 pr-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-overlay/90 hover:shadow-[0_10px_30px_rgba(99,102,241,0.25)]";

const DOT =
  "size-2 shrink-0 rotate-45 rounded-[2px] bg-linear-to-br from-primary via-violet to-accent shadow-glow transition-transform duration-300 group-hover:scale-125";

const LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.24em] text-muted transition-colors duration-300 group-hover:text-white";

/** Slim showcase naming the stack the product is built on. */
export function TechStrip() {
  return (
    <section
      aria-label="Built with"
      className="relative overflow-hidden border-y border-line bg-surface/40"
    >
      {/* aurora glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-primary/15 via-violet/10 to-transparent blur-[130px]"
      />

      <Reveal className="relative mx-auto w-full max-w-6xl px-5 pt-14 text-center sm:px-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent ring-1 ring-primary/25">
          <Layers className="size-3.5" aria-hidden="true" />
          Engineered, not assembled
        </p>
        <h2 className="mt-5 font-display text-[clamp(1.6rem,2vw+0.9rem,2.4rem)] font-bold tracking-tight text-white [text-wrap:balance]">
          A foundation built for{" "}
          <span className="bg-linear-to-r from-primary via-violet to-accent bg-clip-text text-transparent">
            excellence.
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted [text-wrap:pretty]">
          Every layer of NexaChat is chosen for speed, resilience, and craft —
          nothing bolted on.
        </p>
      </Reveal>

      <div className="marquee relative mt-8 pb-11">
        <TechRow />
        <TechRow reverse />
      </div>
    </section>
  );
}

function TechRow({ reverse = false }: { reverse?: boolean }) {
  const chips = STACK.map((item) => (
    <span key={item} className={CHIP}>
      <span aria-hidden="true" className={DOT} />
      <span className={LABEL}>{item}</span>
    </span>
  ));

  return (
    <div className="marquee-mask">
      <div className={`marquee-track${reverse ? " marquee-track--reverse" : ""}`}>
        <div className="flex shrink-0 items-center gap-4 pr-4">{chips}</div>
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center gap-4 pr-4"
        >
          {chips}
        </div>
      </div>
    </div>
  );
}
