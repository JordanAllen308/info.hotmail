import { PERSONAS } from "./personas";
import { ChatMessage, PersonaId, SessionReport } from "./types";

function scenarioTitle(personaId: string, scenarioId: string): string {
  const persona = PERSONAS[personaId as PersonaId];
  return persona?.scenarios.find((s) => s.id === scenarioId)?.title ?? scenarioId;
}

export function serializeSession(session: {
  id: string;
  persona: string;
  scenario: string;
  level: string;
  messages: string;
  status: string;
  report: string | null;
  xpEarned: number;
  createdAt: Date;
  completedAt: Date | null;
}) {
  return {
    id: session.id,
    persona: session.persona,
    scenario: session.scenario,
    scenarioTitle: scenarioTitle(session.persona, session.scenario),
    level: session.level,
    messages: JSON.parse(session.messages) as ChatMessage[],
    status: session.status,
    report: session.report ? (JSON.parse(session.report) as SessionReport) : null,
    xpEarned: session.xpEarned,
    createdAt: session.createdAt,
    completedAt: session.completedAt,
  };
}
