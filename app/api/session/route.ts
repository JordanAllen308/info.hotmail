import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PERSONAS } from "@/lib/personas";
import { serializeSession } from "@/lib/serialize";
import { ChatMessage, Level, PersonaId } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { personaId, scenarioId } = body as { personaId?: PersonaId; scenarioId?: string };

  const persona = personaId ? PERSONAS[personaId] : undefined;
  if (!persona) {
    return NextResponse.json({ error: "Unknown persona." }, { status: 400 });
  }
  const scenario = persona.scenarios.find((s) => s.id === scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario." }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({ orderBy: { id: "asc" } });
  if (!profile || !profile.onboarded) {
    return NextResponse.json({ error: "Complete onboarding first." }, { status: 400 });
  }

  const openerMessage: ChatMessage = {
    role: "assistant",
    content: scenario.opener,
    ts: Date.now(),
  };

  const session = await prisma.session.create({
    data: {
      persona: persona.id,
      scenario: scenario.id,
      level: profile.level as Level,
      messages: JSON.stringify([openerMessage]),
      status: "active",
    },
  });

  return NextResponse.json({ session: serializeSession(session) });
}
