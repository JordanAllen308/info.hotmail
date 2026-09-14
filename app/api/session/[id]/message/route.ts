import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CHAT_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { buildChatSystemPrompt } from "@/lib/personas";
import { serializeSession } from "@/lib/serialize";
import { ChatMessage, Level, MistakeData, PersonaId } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { content } = body as { content?: string };

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Message content is required." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.status === "completed") {
    return NextResponse.json({ error: "This session has already ended." }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({ orderBy: { id: "asc" } });
  const recentMistakes = await prisma.mistake.findMany({
    orderBy: [{ occurrences: "desc" }, { lastSeenAt: "desc" }],
    take: 8,
  });

  const history = JSON.parse(session.messages) as ChatMessage[];
  const userMessage: ChatMessage = { role: "user", content: content.trim(), ts: Date.now() };
  const updatedHistory = [...history, userMessage];

  const systemPrompt = buildChatSystemPrompt({
    personaId: session.persona as PersonaId,
    scenarioId: session.scenario,
    level: session.level as Level,
    notes: profile?.notes,
    recurringMistakes: recentMistakes as unknown as MistakeData[],
  });

  let assistantText = "";
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 400,
      system: systemPrompt,
      messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
    });
    const textBlock = response.content.find((b) => b.type === "text");
    assistantText = textBlock && "text" in textBlock ? textBlock.text : "";
  } catch (err) {
    console.error("Anthropic chat error:", err);
    return NextResponse.json(
      { error: "Failed to get a response from the AI. Please check your API key and try again." },
      { status: 502 }
    );
  }

  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: assistantText || "...",
    ts: Date.now(),
  };
  const finalHistory = [...updatedHistory, assistantMessage];

  const updated = await prisma.session.update({
    where: { id: session.id },
    data: { messages: JSON.stringify(finalHistory) },
  });

  return NextResponse.json({ session: serializeSession(updated) });
}
