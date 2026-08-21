"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Reveal } from "./Reveal";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does NexaChat deliver real-time messages instantly?",
    answer:
      "NexaChat connects to a high-performance Socket.IO realtime layer alongside a resilient REST API. When you send a message, it renders optimistically on your screen while pushing through low-latency WebSocket channels to all conversation participants instantly.",
  },
  {
    question: "Do I need to remember a password to sign in?",
    answer:
      "No password is required! NexaChat uses phone-number identity verification. When entering a unique number for the first time, your account is created automatically. Logging in again with the same number retrieves your existing account and updates your display name seamlessly.",
  },
  {
    question: "How do group conversations and admin controls work?",
    answer:
      "Groups require a minimum of 3 members. The creator is assigned admin privileges to rename the group, invite new participants, remove members, or promote others to admin status. If an admin leaves, adminship auto-transfers to a remaining member.",
  },
  {
    question: "Can I search for users by display name or phone number?",
    answer:
      "Yes! The instant search engine accepts display names (case-insensitive substring and prefix matches) as well as phone numbers with or without country code separators. You can start a one-to-one conversation directly from the search dialog.",
  },
  {
    question: "What happens if my connection drops while chatting?",
    answer:
      "NexaChat features automatic reconnect healing. The connection banner alerts you if the network drops, and once reconnected, local TanStack Query caches automatically synchronize any messages missed while offline.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="relative">
      <div className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet ring-1 ring-violet/20">
            <HelpCircle className="size-3.5" aria-hidden="true" />
            Answers at a Glance
          </p>
          <h2 className="mt-4 font-display font-bold tracking-tight text-white [font-size:clamp(2rem,3vw+1rem,3.25rem)] [text-wrap:balance]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-white/80 [text-wrap:pretty]">
            Everything you need to know about NexaChat&apos;s real-time messaging, group management, and security.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={faq.question} delay={index * 0.08}>
                <div className="overflow-hidden rounded-2xl border border-line bg-surface/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="font-display text-base font-bold text-white sm:text-lg">
                      {faq.question}
                    </span>
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-xl bg-raised text-white transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-primary/20 text-accent" : ""
                      }`}
                    >
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="border-t border-line/50 px-6 pb-6 pt-4 text-sm leading-relaxed text-white sm:text-base font-medium">
                          {faq.answer}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
