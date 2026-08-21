"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * Feature trio (plan §9): Real-time / Groups / Instant search, each with a
 * mini animated vignette. Vignettes animate once on reveal and render static
 * under prefers-reduced-motion.
 */

const FEATURES = [
  {
    icon: <Zap className="size-5" aria-hidden="true" />,
    title: "Real-time delivery",
    body: "A live socket keeps every conversation in lockstep — messages land the moment they're sent, with reconnects that heal themselves.",
    vignette: <RealtimeVignette />,
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden="true" />,
    title: "Groups without friction",
    body: "Spin up a crew in seconds. Admins rename, add, remove, and promote; everyone else just enjoys the conversation.",
    vignette: <GroupsVignette />,
  },
  {
    icon: <Search className="size-5" aria-hidden="true" />,
    title: "Instant search",
    body: "Start typing a name and the directory answers as you go — pick a person and you're already talking.",
    vignette: <SearchVignette />,
  },
] as const;

export function Features() {
  return (
    <section id="features" aria-label="Features" className="relative">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent ring-1 ring-primary/20">
            Crafted for speed & clarity
          </p>
          <h2 className="mt-4 font-display font-bold tracking-tight text-white text-[clamp(2rem,3vw+1rem,3.25rem)] text-wrap-balance">
            Everything a conversation needs.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted text-wrap-pretty">
            No setup ceremonies, no lost threads — just the mechanics of great
            messaging, done properly with luxury engineering.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.12}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface/60 p-1 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(99,102,241,0.18)]">
                <div
                  aria-hidden="true"
                  className="flex h-44 items-center justify-center rounded-t-[1.1rem] border-b border-line bg-linear-to-br from-primary/15 via-violet/5 to-transparent"
                >
                  {feature.vignette}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="flex items-center gap-3 font-display text-lg font-bold tracking-tight text-white">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/25 to-violet/25 text-white ring-1 ring-primary/40 shadow-glow">
                      {feature.icon}
                    </span>
                    <span className="text-white font-display text-lg font-bold">{feature.title}</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {feature.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- vignettes ------------------------------- */

function RealtimeVignette() {
  const reduced = useReducedMotion();
  return (
    <div className="flex w-full max-w-56 flex-col gap-2 px-6">
      <motion.span
        initial={reduced ? false : { opacity: 0, x: -14 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
        className="self-start rounded-xl rounded-bl-sm bg-raised px-3 py-1.5 text-xs ring-1 ring-line"
      >
        on my way
      </motion.span>
      <motion.span
        initial={reduced ? false : { opacity: 0, x: 14 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.45 }}
        className="self-end rounded-xl rounded-br-sm bg-linear-to-br from-primary to-violet px-3 py-1.5 text-xs text-white shadow-glow"
      >
        already here
      </motion.span>
      <motion.span
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.8 }}
        className="absolute right-8 top-6 flex size-7 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/40"
      >
        <Zap className="size-4" />
      </motion.span>
    </div>
  );
}

const CREW = ["Ada", "Grace", "Linus", "Edsger"];

function GroupsVignette() {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex items-center justify-center">
      <div className="flex -space-x-3">
        {CREW.map((name, index) => (
          <motion.span
            key={name}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: 0.15 + index * 0.12,
            }}
            className={`flex items-center justify-center rounded-full bg-linear-to-br text-xs font-semibold text-white ring-2 ring-surface ${
              index % 2 === 0
                ? "from-primary to-violet"
                : "from-violet to-accent"
            } ${index % 2 === 0 ? "size-11" : "size-11"}`}
          >
            {name.slice(0, 1)}
          </motion.span>
        ))}
      </div>
      <motion.span
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.85 }}
        className="absolute -right-2 -top-3 flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[10px] font-medium text-success ring-1 ring-success/40"
      >
        <ShieldCheck className="size-3" />
        Admin
      </motion.span>
    </div>
  );
}

function SearchVignette() {
  const reduced = useReducedMotion();
  const results = ["Ada Lovelace", "Adam Smith"];
  return (
    <div className="w-full max-w-52 space-y-1.5 px-6">
      <div className="flex h-9 items-center gap-2 rounded-xl bg-raised px-3 ring-1 ring-line">
        <Search className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
        <span className="text-xs text-muted">Ad</span>
        <motion.span
          animate={reduced ? undefined : { opacity: [1, 0, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 1] }}
          className="h-3.5 w-px bg-accent"
          aria-hidden="true"
        />
      </div>
      {results.map((name, index) => (
        <motion.div
          key={name}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.5 + index * 0.25 }}
          className="flex h-8 items-center gap-2 rounded-lg bg-raised px-3 ring-1 ring-line"
        >
          <span className="flex size-4 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet text-[8px] font-semibold text-white">
            {name.slice(0, 1)}
          </span>
          <span className="truncate text-[11px]">{name}</span>
        </motion.div>
      ))}
    </div>
  );
}
