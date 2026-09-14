import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { REPORT_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { buildReportSystemPrompt } from "@/lib/personas";
import { serializeSession } from "@/lib/serialize";
import { computeStreak } from "@/lib/gamification";
import { ChatMessage, Level, SessionReport, XP_PER_MESSAGE, XP_PER_SESSION } from "@/lib/types";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.status === "completed" && session.report) {
    return NextResponse.json({ session: serializeSession(session) });
  }

  const history = JSON.parse(session.messages) as ChatMessage[];
  const userMessageCount = history.filter((m) => m.role === "user").length;

  let report: SessionReport = {
    grammarMistakes: [],
    vocabSuggestions: [],
    fluencyObservations: [],
    focusNext: "Keep practicing — try to speak a little more in your next session!",
    strengths: [],
    summary: "Session completed.",
  };

  if (userMessageCount === 0) {
    report.summary = "You didn't send any messages this session, so there's nothing to analyze yet. Jump back in and give it a try!";
  } else {
    try {
      const anthropic = getAnthropicClient();
      const transcript = history
        .map((m) => `${m.role === "user" ? "USER" : "CHARACTER"}: ${m.content}`)
        .join("\n");

      const response = await anthropic.messages.create({
        model: REPORT_MODEL,
        max_tokens: 1500,
        system: buildReportSystemPrompt(session.level as Level),
        messages: [{ role: "user", content: `Transcript:\n\n${transcript}` }],
      });
      const textBlock = response.content.find((b) => b.type === "text");
      const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      report = {
        grammarMistakes: Array.isArray(parsed.grammarMistakes) ? parsed.grammarMistakes : [],
        vocabSuggestions: Array.isArray(parsed.vocabSuggestions) ? parsed.vocabSuggestions : [],
        fluencyObservations: Array.isArray(parsed.fluencyObservations) ? parsed.fluencyObservations : [],
        focusNext: typeof parsed.focusNext === "string" ? parsed.focusNext : report.focusNext,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        summary: typeof parsed.summary === "string" ? parsed.summary : report.summary,
      };
    } catch (err) {
      console.error("Anthropic report error:", err);
      return NextResponse.json(
        { error: "Failed to generate the session report. Please check your API key and try again." },
        { status: 502 }
      );
    }
  }

  // Update recurring mistake tracker
  for (const gm of report.grammarMistakes) {
    await upsertMistake("grammar", gm.mistake, gm.mistake, gm.correction);
  }
  for (const vs of report.vocabSuggestions) {
    await upsertMistake("vocabulary", vs.youSaid, vs.youSaid, vs.betterOption);
  }

  // Gamification: XP + streak
  const xpEarned = userMessageCount > 0 ? XP_PER_SESSION + userMessageCount * XP_PER_MESSAGE : 0;
  const profile = await prisma.profile.findFirst({ orderBy: { id: "asc" } });
  if (profile) {
    const streakAction = computeStreak(profile.lastSessionDate, new Date());
    const newStreak =
      streakAction === "reset" ? 1 : streakAction === "increment" ? profile.streak + 1 : profile.streak;

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        xp: profile.xp + xpEarned,
        streak: newStreak,
        longestStreak: Math.max(profile.longestStreak, newStreak),
        lastSessionDate: new Date(),
      },
    });
  }

  const updated = await prisma.session.update({
    where: { id: session.id },
    data: {
      status: "completed",
      report: JSON.stringify(report),
      xpEarned,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ session: serializeSession(updated) });
}

async function upsertMistake(
  category: "grammar" | "vocabulary",
  description: string,
  example: string,
  correction: string
) {
  if (!description || !description.trim()) return;
  const normalized = description.trim().toLowerCase().slice(0, 200);

  const existing = await prisma.mistake.findFirst({
    where: { category, description: { equals: normalized } },
  });

  if (existing) {
    await prisma.mistake.update({
      where: { id: existing.id },
      data: {
        occurrences: existing.occurrences + 1,
        lastSeenAt: new Date(),
        example: example.slice(0, 300),
        correction: correction?.slice(0, 300),
      },
    });
  } else {
    await prisma.mistake.create({
      data: {
        category,
        description: normalized,
        example: example.slice(0, 300),
        correction: correction?.slice(0, 300),
      },
    });
  }
}
