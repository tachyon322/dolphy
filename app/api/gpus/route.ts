import { NextResponse } from "next/server";
import { gpuTypes } from "@/lib/mocks/gpus";
import { getRunpodClient, isMockMode } from "@/lib/runpod";

export async function GET() {
  try {
    const client = getRunpodClient();
    const gpus = await client.listGpus();
    return NextResponse.json(
      {
        gpus,
        mock: isMockMode(),
        count: gpus.length,
      },
      {
        headers: {
          "x-mock": isMockMode() ? "true" : "false",
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    // fallback to mocks
    return NextResponse.json({ gpus: gpuTypes, mock: true, error: String(e) });
  }
}
