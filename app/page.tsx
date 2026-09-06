import { HowItWorks } from "@/components/sections/HowItWorks";
import { GpuMarketplace } from "@/components/sections/GpuMarketplace";
import { Hero } from "@/components/sections/Hero";
import { Manifest } from "@/components/sections/Manifest";
import { Metrics } from "@/components/sections/Metrics";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-[var(--bg-app)]">
      {/* Hero → How it works → Why dolphy → Market → Metrics */}
      <Hero />
      <HowItWorks />
      <Manifest />
      <GpuMarketplace />
      <Metrics />
    </main>
  );
}
