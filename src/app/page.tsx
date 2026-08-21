import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
    </div>
  );
}
