import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeSession } from "@/lib/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  return NextResponse.json({ session: serializeSession(session) });
}
