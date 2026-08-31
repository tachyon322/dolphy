import { CliSection } from "@/components/sections/CliSection";
import { Hero } from "@/components/sections/Hero";
import { Manifest } from "@/components/sections/Manifest";
import { Metrics } from "@/components/sections/Metrics";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-[var(--bg-app)]">
      {/* River → Grid → River → Grid — inhale / exhale */}
      <Hero />
      <CliSection />
      <Manifest />
      <Metrics />
    </main>
  );
}
