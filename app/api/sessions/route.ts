import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeSession } from "@/lib/serialize";

export async function GET() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ sessions: sessions.map(serializeSession) });
}
