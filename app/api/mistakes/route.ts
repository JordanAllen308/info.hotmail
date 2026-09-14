import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const mistakes = await prisma.mistake.findMany({
    orderBy: [{ occurrences: "desc" }, { lastSeenAt: "desc" }],
    take: 30,
  });
  return NextResponse.json({ mistakes });
}
