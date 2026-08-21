"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ReplayLine {
  mine: boolean;
  text: string;
}

/** The scripted demo conversation that loops inside the hero mockup. */
const SCRIPT: ReplayLine[] = [
  { mine: false, text: "Welcome to NexaChat." },
  { mine: true, text: "Messages arrive the instant they're sent." },
  { mine: false, text: "Pull up a chair ,the whole crew is here." },
  { mine: true, text: "Groups too? I manage three teams from here now." },
  { mine: false, text: "Search a name, say hi. That's the whole trick." },
];

const LEAD_MS = 500;
const TYPE_MS = 900;
const GAP_MS = 700;
const HOLD_MS = 2600;
const LOOP_RESET_MS = 300;

const noopSubscribe = () => () => {};

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Live scripted replay: typing indicator → bubbles appear in sequence, hold,
 * loop forever. Under prefers-reduced-motion the timer engine never starts
 * and the full transcript renders statically.
 */
export function ChatReplay() {
  const reduced = usePrefersReducedMotion();
  const framerReduced = useReducedMotion();
  const [state, setState] = useState({ shown: 0, typing: false });
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return; // static transcript path ,no timers at all
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    void (async () => {
      while (!cancelled) {
        setState({ shown: 0, typing: false });
        await wait(LEAD_MS);
        if (cancelled) return;
        for (let i = 0; i < SCRIPT.length; i++) {
          setState({ shown: i, typing: true });
          await wait(TYPE_MS);
          if (cancelled) return;
          setState({ shown: i + 1, typing: false });
          await wait(GAP_MS);
          if (cancelled) return;
        }
        await wait(HOLD_MS);
        if (cancelled) return;
        await wait(LOOP_RESET_MS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reduced]);

  // Keep the latest bubble in view inside the fixed-height mockup.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.shown, state.typing]);

  const lines = reduced ? SCRIPT : SCRIPT.slice(0, state.shown);

  return (
    <div
      ref={bodyRef}
      className="flex h-72 flex-col gap-2.5 overflow-y-auto p-4"
      aria-label="Demo conversation"
      role="img"
    >
      {lines.map((line, index) => (
        <motion.div
          key={index}
          initial={framerReduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`flex ${line.mine ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-[1.6] tracking-[0.01em] ${
              line.mine
                ? "rounded-br-md bg-gradient-to-br from-primary to-violet text-white ring-1 ring-white/15 shadow-glow"
                : "rounded-bl-md bg-raised text-fg ring-1 ring-line"
            }`}
          >
            {line.text}
            <span
              className={`ml-2 align-baseline text-[10px] ${
                line.mine ? "text-white/70" : "text-faint"
              }`}
            >
              {`09:${(41 + index).toString().padStart(2, "0")}`}
            </span>
          </div>
        </motion.div>
      ))}

      {!reduced && state.typing ? (
        <div className="flex justify-start">
          <div
            aria-label="Typing…"
            className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-raised px-3.5 py-2.5 ring-1 ring-line"
          >
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                style={{ animationDelay: `${delay}ms` }}
                className="size-1.5 animate-bounce rounded-full bg-muted"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
