import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuote, consumeQuote, markTxUsed, isTxUsed, createRental, logFailedRental, upsertUser } from "@/lib/quoteStore";
import { getRunpodClient } from "@/lib/runpod";
import { verifySolPayment, verifyTokenPayment, getTreasury, getTokenMint } from "@/lib/solana";

const schema = z.object({
  quoteId: z.string().min(1),
  signature: z.string().min(10),
  wallet: z.string().min(10),
  payWith: z.enum(["SOL", "TOKEN"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { quoteId, signature, wallet, payWith } = parsed.data;

    if (isTxUsed(signature)) {
      return NextResponse.json({ error: "Transaction already used (replay protection)" }, { status: 409 });
    }

    const quote = getQuote(quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found or expired. Create a new quote." }, { status: 404 });
    }

    // Account sighting — logged even if payment fails below.
    upsertUser(wallet);

    // Builds a failed-attempt row; caller decides whether to mark the sig used.
    const logFail = (reason: string) =>
      logFailedRental({
        id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        quoteId,
        gpuId: quote.gpuId,
        gpuName: quote.gpuName,
        hours: quote.hours,
        payWith: quote.payWith,
        amountPaid: (quote.payWith === "SOL" ? quote.priceSolLamports : quote.priceTokenAtomic).toString(),
        txSignature: signature,
        wallet,
        status: "failed",
        failureReason: reason,
        createdAt: Date.now(),
        expiresAt: Date.now(),
      });

    // payWith must match quote if provided
    const expectedPay = payWith ?? quote.payWith;
    if (expectedPay !== quote.payWith) {
      return NextResponse.json({ error: "payWith mismatch with quote" }, { status: 400 });
    }

    const treasury = getTreasury();
    const tokenMint = getTokenMint();

    // If treasury not configured or mock mode, skip on-chain verification (allow any sig for testing)
    const skipVerify = !treasury || process.env.SKIP_SOLANA_VERIFY === "true" || process.env.NEXT_PUBLIC_SKIP_VERIFY === "true";

    if (!skipVerify) {
      if (quote.payWith === "SOL") {
        const minLamports = quote.priceSolLamports;
        const res = await verifySolPayment({
          signature,
          expectedWallet: wallet,
          expectedTreasury: treasury,
          minLamports,
        });
        if (!res.ok) {
          const reason = `SOL verification failed: ${res.error}`;
          logFail(reason);
          markTxUsed(signature); // dead sig — block reuse
          return NextResponse.json({ error: reason }, { status: 402 });
        }
      } else {
        const minAtomic = quote.priceTokenAtomic;
        const res = await verifyTokenPayment({
          signature,
          expectedWallet: wallet,
          minAtomic,
          mint: tokenMint,
        });
        if (!res.ok) {
          const reason = `TOKEN verification failed: ${res.error}`;
          logFail(reason);
          markTxUsed(signature); // dead sig — block reuse
          return NextResponse.json({ error: reason }, { status: 402 });
        }
      }
    } else {
      // Basic sig format check
      if (signature.length < 20) {
        return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
      }
      // In mock, we still mark tx as used
    }

    // Provision RunPod (mock or live)
    const client = getRunpodClient();
    const rentalId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    let pod;
    try {
      pod = await client.createPod({
        gpuTypeId: quote.gpuId,
        hours: quote.hours,
        rentalId,
        wallet,
      });
    } catch (e) {
      console.error("[rent/verify] runpod create failed", e);
      const reason = `RunPod provision failed: ${String(e)}`;
      logFail(reason); // sig stays reusable — user can retry with it
      return NextResponse.json({ error: reason }, { status: 502 });
    }

    const now = Date.now();
    const rental = {
      id: rentalId,
      quoteId,
      gpuId: quote.gpuId,
      gpuName: quote.gpuName,
      hours: quote.hours,
      payWith: quote.payWith,
      amountPaid: (quote.payWith === "SOL" ? quote.priceSolLamports : quote.priceTokenAtomic).toString(),
      txSignature: signature,
      wallet,
      status: "active" as const,
      podId: pod.id,
      endpoint: pod.endpoint,
      sshCommand: pod.sshCommand,
      createdAt: now,
      expiresAt: now + quote.hours * 3600 * 1000,
    };

    createRental(rental);
    consumeQuote(quoteId); // used up — must not land in expired_quotes later
    // mark tx is done inside createRental

    return NextResponse.json({
      success: true,
      rental,
      pod,
      mock: !treasury || skipVerify,
    });
  } catch (e) {
    console.error("[rent/verify] error", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
