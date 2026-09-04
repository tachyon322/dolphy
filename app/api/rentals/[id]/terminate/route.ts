import { NextResponse } from "next/server";
import { z } from "zod";
import { getRental, terminateRental } from "@/lib/quoteStore";
import { getRunpodClient } from "@/lib/runpod";

const schema = z.object({
  wallet: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const rental = getRental(id);
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }
    if (rental.wallet && rental.wallet !== parsed.data.wallet) {
      return NextResponse.json({ error: "Not your rental" }, { status: 403 });
    }
    if (rental.status === "terminated") {
      return NextResponse.json({ rental });
    }

    if (rental.podId) {
      try {
        await getRunpodClient().terminatePod(rental.podId);
      } catch (e) {
        console.error("[rentals/terminate] runpod terminate failed", e);
        return NextResponse.json(
          { error: `RunPod terminate failed: ${String(e)}` },
          { status: 502 }
        );
      }
    }

    const updated = terminateRental(id);
    return NextResponse.json({ rental: updated });
  } catch (e) {
    console.error("[rentals/terminate] error", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
