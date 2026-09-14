import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Level } from "@/lib/types";

const VALID_LEVELS: Level[] = ["A1", "B1", "B2"];

async function getOrCreateProfile() {
  let profile = await prisma.profile.findFirst({ orderBy: { id: "asc" } });
  if (!profile) {
    profile = await prisma.profile.create({
      data: { level: "A1", onboarded: false },
    });
  }
  return profile;
}

export async function GET() {
  const profile = await getOrCreateProfile();
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { level, notes } = body as { level?: string; notes?: string };

  if (!level || !VALID_LEVELS.includes(level as Level)) {
    return NextResponse.json({ error: "A valid level (A1, B1, B2) is required." }, { status: 400 });
  }

  const existing = await getOrCreateProfile();
  const profile = await prisma.profile.update({
    where: { id: existing.id },
    data: {
      level,
      notes: notes?.slice(0, 8000) ?? existing.notes,
      onboarded: true,
    },
  });

  return NextResponse.json({ profile });
}
