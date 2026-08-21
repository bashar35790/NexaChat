import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TechStrip } from "@/components/landing/TechStrip";
import { CtaBand, Footer } from "@/components/landing/CtaBand";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Features />
        <TechStrip />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
