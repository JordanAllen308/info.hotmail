# SpeakUp

An English speaking practice app focused on real conversation, not multiple-choice drills. Pick a persona (Friend, Client, Professional, Doctor, CEO), chat naturally at your level (A1/B1/B2), then end the session to get an AI-generated report on your grammar, vocabulary, and fluency — with recurring mistakes tracked and fed back into future conversations.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS, mobile-first, installable as a PWA
- Prisma + SQLite for persistence
- Anthropic Claude API for chat and session reports

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example and fill in your Anthropic API key:

   ```bash
   cp .env.example .env
   ```

   Set `ANTHROPIC_API_KEY` in `.env`. `DATABASE_URL` already points at a local SQLite file.

3. Create the database:

   ```bash
   npm run db:push
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## How it works

- **Onboarding** (`/onboarding`): pick a level and optionally paste/upload study notes. Stored in a single local `Profile`.
- **Home** (`/`): streak/XP header, level progress bar, and persona cards. Tapping a persona opens a scenario picker; starting one creates a `Session`.
- **Chat** (`/chat/[id]`): back-and-forth conversation. The system prompt is built per persona/scenario/level, and includes your notes plus your top recurring mistakes (for context only — the AI never corrects you mid-conversation).
- **Report** (`/report/[id]`): ending a session sends the full transcript to Claude, which returns grammar mistakes, vocabulary suggestions, fluency observations, strengths, and one focus area. Mistakes are upserted into a running `Mistake` table (occurrence count + last seen), and XP/streak are updated on the `Profile`.
- **Progress** (`/progress`): streak, XP, level progress, this week vs. last week session counts with a simple improvement trend, top 3 recurring mistakes, and full session history.

## Notes

- This is a single-user local app (no auth) — the `Profile` is a single row.
- Voice/call features are intentionally out of scope for this phase.
