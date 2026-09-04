import { NextResponse } from "next/server";
import { listUsers } from "@/lib/quoteStore";

export async function GET() {
  const users = listUsers();
  return NextResponse.json({ users, count: users.length });
}
