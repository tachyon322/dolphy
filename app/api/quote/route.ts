import { NextResponse } from "next/server";
import { z } from "zod";
import { calcPrice } from "@/lib/pricing";
import { getGpuById } from "@/lib/mocks/gpus";
import { createQuote } from "@/lib/quoteStore";

const schema = z.object({
  gpuId: z.string().min(1),
  hours: z.number().int().min(1).max(720),
  payWith: z.enum(["SOL", "TOKEN"]),
  wallet: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { gpuId, hours, payWith, wallet } = parsed.data;
    const gpu = getGpuById(gpuId);
    if (!gpu) return NextResponse.json({ error: "GPU not found" }, { status: 404 });
    if (!gpu.available) return NextResponse.json({ error: "GPU not available" }, { status: 409 });

    const pricing = calcPrice(gpuId, hours, payWith);
    const id = `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const quote = {
      id,
      gpuId,
      gpuName: gpu.displayName,
      hours: pricing.hours,
      payWith,
      priceSolLamports: pricing.totalLamports,
      priceTokenAtomic: pricing.totalAtomic,
      totalSol: calcPrice(gpuId, hours, "SOL").total,
      totalToken: calcPrice(gpuId, hours, "TOKEN").total,
      wallet: wallet ?? "",
      expiresAt: now + 2 * 60 * 1000, // 2 min
      createdAt: now,
    };

    // For response, choose amount based on payWith
    const amount = payWith === "SOL" ? pricing.total : pricing.total;
    const amountLamports = payWith === "SOL" ? pricing.totalLamports.toString() : pricing.totalAtomic.toString();

    createQuote({
      id,
      gpuId,
      gpuName: gpu.displayName,
      hours: pricing.hours,
      payWith,
      priceSolLamports: calcPrice(gpuId, hours, "SOL").totalLamports,
      priceTokenAtomic: calcPrice(gpuId, hours, "TOKEN").totalAtomic,
      totalSol: calcPrice(gpuId, hours, "SOL").total,
      totalToken: calcPrice(gpuId, hours, "TOKEN").total,
      wallet: wallet ?? "",
      expiresAt: quote.expiresAt,
      createdAt: now,
    });

    const treasury = process.env.NEXT_PUBLIC_TREASURY_WALLET || process.env.TREASURY_WALLET || "";
    const tokenMint = process.env.NEXT_PUBLIC_TOKEN_MINT || process.env.TOKEN_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

    return NextResponse.json({
      quoteId: id,
      gpuId,
      gpuName: gpu.displayName,
      hours: pricing.hours,
      payWith,
      amount,
      amountLamports: amountLamports,
      // for client display
      totalSol: quote.totalSol,
      totalToken: quote.totalToken,
      priceSolPerHour: gpu.priceSolPerHour,
      priceTokenPerHour: gpu.priceTokenPerHour,
      expiresAt: quote.expiresAt,
      treasury,
      tokenMint,
      rpcUrl,
      network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    });
  } catch (e) {
    console.error("[quote] error", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
