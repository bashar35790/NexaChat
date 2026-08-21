import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Faq } from "@/components/landing/Faq";
import { TechStrip } from "@/components/landing/TechStrip";
import { CtaBand, Footer } from "@/components/landing/CtaBand";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-fg focus:ring-1 focus:ring-line-strong"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Hero />
        <Features />
        <Faq />
        <TechStrip />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
