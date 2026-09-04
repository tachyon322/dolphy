import { NextResponse } from "next/server";
import { listExpiredQuotes } from "@/lib/quoteStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const quotes = listExpiredQuotes(wallet ?? undefined);
  return NextResponse.json({ quotes, count: quotes.length });
}
