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

/** Slim strip naming the stack the product is built on. */
export function TechStrip() {
  return (
    <section aria-label="Built with" className="border-y border-line">
      <Reveal className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-[0.18em] text-faint">
          {STACK.map((item) => (
            <li
              key={item}
              className="rounded-full px-3 py-1 ring-1 ring-line"
            >
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
