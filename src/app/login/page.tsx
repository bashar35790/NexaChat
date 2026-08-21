import type { Metadata } from "next";
import { MessageCircle, Search, Users, Zap } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";
import { RedirectIfAuthed } from "@/components/auth/RedirectIfAuthed";

export const metadata: Metadata = {
  title: "Sign in",
};

const HIGHLIGHTS = [
  { icon: Zap, label: "Real-time delivery" },
  { icon: Users, label: "Groups with roles" },
  { icon: Search, label: "Instant people search" },
] as const;

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden lg:grid lg:grid-cols-[1.1fr_1fr]">
      <RedirectIfAuthed />
      {/* ---- hero side ---- */}
      <section
        aria-hidden="true"
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16"
      >
        <span className="aurora-orb left-[-10%] top-[-15%] h-[34rem] w-[34rem] bg-primary/25" />
        <span
          className="aurora-orb bottom-[-20%] right-[-8%] h-[30rem] w-[30rem] bg-violet/25"
          style={{ animationDelay: "-6s" }}
        />
        <span
          className="aurora-orb left-[35%] top-[45%] h-[22rem] w-[22rem] bg-accent/15"
          style={{ animationDelay: "-12s" }}
        />

        <div className="relative z-10 flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-fg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet shadow-glow">
            <MessageCircle className="h-5 w-5 text-white" />
          </span>
          NexaChat
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-fg xl:text-6xl">
            Conversations at the{" "}
            <span className="bg-gradient-to-r from-primary via-violet to-accent bg-clip-text text-transparent">
              speed of thought.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            One-to-one and group messaging that lands instantly — no inbox,
            no noise. Just pick a name, drop your number, and you are in.
          </p>

          <ul className="mt-10 flex flex-wrap gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-full bg-surface/60 px-4 py-2 text-sm text-muted ring-1 ring-line backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-accent" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-faint">
          No password. Your number is your identity.
        </p>
      </section>

      {/* ---- form side ---- */}
      <section className="relative flex flex-1 items-center justify-center px-5 py-14 sm:px-8">
        <span className="aurora-orb left-[-30%] top-[-20%] h-[26rem] w-[26rem] bg-primary/20 lg:hidden" />

        <LoginCard />
      </section>
    </main>
  );
}
