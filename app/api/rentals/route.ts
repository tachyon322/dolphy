import { NextResponse } from "next/server";
import { listRentals, listRentalsByWallet } from "@/lib/quoteStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const all = wallet ? listRentalsByWallet(wallet) : listRentals();
  return NextResponse.json({ rentals: all, count: all.length });
}
