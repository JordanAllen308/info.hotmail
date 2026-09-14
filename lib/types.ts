export type Level = "A1" | "B1" | "B2";

export type PersonaId = "friend" | "client" | "professional" | "doctor" | "ceo";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  opener: string;
}

export interface Persona {
  id: PersonaId;
  name: string;
  tagline: string;
  emoji: string;
  color: string; // tailwind color key from speak palette
  systemPromptBase: string;
  scenarios: Scenario[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface GrammarMistake {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface VocabSuggestion {
  youSaid: string;
  betterOption: string;
  why: string;
}

export interface SessionReport {
  grammarMistakes: GrammarMistake[];
  vocabSuggestions: VocabSuggestion[];
  fluencyObservations: string[];
  focusNext: string;
  strengths: string[];
  summary: string;
}

export interface ProfileData {
  id: number;
  level: Level;
  notes: string | null;
  xp: number;
  streak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  onboarded: boolean;
}

export interface MistakeData {
  id: string;
  category: "grammar" | "vocabulary" | "fluency";
  description: string;
  example: string | null;
  correction: string | null;
  occurrences: number;
  lastSeenAt: string;
}

export interface SessionData {
  id: string;
  persona: PersonaId;
  scenario: string;
  scenarioTitle: string;
  level: Level;
  messages: ChatMessage[];
  status: "active" | "completed";
  report: SessionReport | null;
  xpEarned: number;
  createdAt: string;
  completedAt: string | null;
}

export interface SessionListItem {
  id: string;
  persona: PersonaId;
  scenario: string;
  level: Level;
  status: "active" | "completed";
  xpEarned: number;
  createdAt: string;
  completedAt: string | null;
  reportSummary: string | null;
}

export const LEVELS: { id: Level; label: string; description: string }[] = [
  { id: "A1", label: "A1 · Beginner", description: "Simple words and short sentences" },
  { id: "B1", label: "B1 · Intermediate", description: "Everyday conversation with some complexity" },
  { id: "B2", label: "B2 · Upper Intermediate", description: "Natural, near-native conversation" },
];

export const XP_PER_SESSION = 20;
export const XP_PER_MESSAGE = 2;
export const LEVEL_ORDER: Level[] = ["A1", "B1", "B2"];
export const XP_TO_NEXT_LEVEL = 300;
