import { notFound } from "next/navigation";
import { gpuTypes, getGpuById } from "@/lib/mocks/gpus";
import { RentPanel } from "@/components/rent/RentPanel";
import Link from "next/link";

export function generateStaticParams() {
  return gpuTypes.map((g) => ({ id: g.id }));
}

export default async function MarketplaceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gpu = getGpuById(id);
  if (!gpu) notFound();

  return (
    <main className="flex flex-1 flex-col bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 pb-16 pt-[calc(var(--nav-height)+24px)] max-[809px]:px-5">
        <Link href="/marketplace" className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-[#0d0d0d] hover:bg-black/5">
          ← Marketplace
        </Link>

        <div className="grid grid-cols-[1.1fr_0.9fr] gap-8 max-[1024px]:grid-cols-1">
          <div>
            <div className="rounded-[20px] border border-black/[0.07] bg-white p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-[#fafafa] text-[#0d0d0d99]">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}>
                      <rect x={3} y={3} width={18} height={18} rx={2} />
                      <path d="M3 9h18M9 21V9" strokeWidth={0.9} opacity={0.4} />
                      <rect x={9} y={9} width={6} height={6} fill="currentColor" opacity={0.9} />
                    </svg>
                  </span>
                  <div>
                    <h1 className="font-display text-[28px] font-semibold leading-none text-[#0d0d0d]" style={{ fontFamily: "var(--font-display)" }}>
                      {gpu.displayName}
                    </h1>
                    <p className="mt-1 font-mono text-[13px] text-[#0d0d0d66]" style={{ fontFamily: "var(--font-mono)" }}>
                      {gpu.vram}GB · {gpu.memoryType} · {gpu.category}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${gpu.available ? "bg-[#00d084]/10 text-[#00a56a] border border-[#00d084]/20" : "bg-black/5 text-black/40"}`}>
                  {gpu.available ? "Available" : "Limited"}
                </span>
              </div>
              <p className="river-copy mt-4 text-[15px] leading-[1.6] text-[#0d0d0d99]" style={{ fontFamily: "var(--font-display)" }}>
                {gpu.description} — Provisioned via RunPod. Mock until live keys. Pay with SOL or any SPL token (15% cheaper) on devnet.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#fafafa] border border-black/5 p-3">
                  <p className="font-mono text-[11px] tracking-[0.06em] text-black/40">VRAM</p>
                  <p className="font-mono text-sm font-semibold">{gpu.vram} GB</p>
                </div>
                <div className="rounded-xl bg-[#fafafa] border border-black/5 p-3">
                  <p className="font-mono text-[11px] tracking-[0.06em] text-black/40">USD / hour</p>
                  <p className="font-mono text-sm font-semibold">${gpu.pricePerHourUsd.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-[#fafafa] border border-black/5 p-3">
                  <p className="font-mono text-[11px] tracking-[0.06em] text-black/40">RunPod ID</p>
                  <p className="font-mono text-[11px] font-medium truncate">{gpu.runpodId}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 font-mono text-xs leading-[1.5] text-amber-800">
                Mock mode: no RunPod API key configured. Rentals create fake pods instantly. When you configure <code className="rounded bg-white px-1">NEXT_PUBLIC_TREASURY_WALLET</code> + <code className="rounded bg-white px-1">RUNPOD_API_KEY</code>, it switches to live verification + provision without code change.
              </div>
            </div>

            <div className="mt-6 rounded-[20px] border border-black/[0.07] bg-[#0d0d0d] p-6 text-white">
              <p className="grid-copy text-[11px] tracking-[0.08em] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>
                HOW IT WORKS
              </p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 font-mono text-[13px] leading-[1.6] text-white/70">
                <li>Create quote (2 min TTL, server-signed pricing)</li>
                <li>Pay with wallet — SOL transfer or SPL transfer to treasury</li>
                <li>Backend verifies tx via Helius RPC (or mock if no treasury)</li>
                <li>RunPod provisions Pod, you get endpoint + SSH</li>
              </ol>
            </div>
          </div>

          <RentPanel gpu={gpu} />
        </div>
      </div>
    </main>
  );
}
