import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
