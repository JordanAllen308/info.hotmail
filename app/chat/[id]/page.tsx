"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PERSONAS } from "@/lib/personas";
import { SessionData } from "@/lib/types";
import ChatBubble from "@/components/ChatBubble";
import TypingDots from "@/components/TypingDots";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/session/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.session) setSession(data.session);
        else router.replace("/");
      });
  }, [params.id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length, sending]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || !session) return;
    setInput("");
    setSending(true);
    setError(null);

    setSession((prev) =>
      prev ? { ...prev, messages: [...prev.messages, { role: "user", content: text, ts: Date.now() }] } : prev
    );

    try {
      const res = await fetch(`/api/session/${params.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message.");
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  async function endSession() {
    setEnding(true);
    setError(null);
    try {
      const res = await fetch(`/api/session/${params.id}/end`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end session.");
      router.push(`/report/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setEnding(false);
    }
  }

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-speak-muted">Loading conversation...</p>
      </div>
    );
  }

  const persona = PERSONAS[session.persona];

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-speak-border bg-white px-4 py-3">
        <button
          onClick={() => setConfirmEnd(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-speak-muted hover:bg-speak-bg"
          aria-label="Back"
        >
          ‹
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-2xl">{persona.emoji}</span>
          <div className="min-w-0">
            <p className="truncate font-extrabold leading-tight">{persona.name}</p>
            <p className="truncate text-xs text-speak-muted">{session.scenarioTitle}</p>
          </div>
        </div>
        <button
          onClick={() => setConfirmEnd(true)}
          disabled={ending}
          className="btn-duo-red !px-4 !py-2 text-xs"
        >
          End Session
        </button>
      </header>

      <main className="scrollbar-none flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {session.messages.map((m, i) => (
          <ChatBubble key={i} message={m} personaEmoji={persona.emoji} />
        ))}
        {sending && <TypingDots personaEmoji={persona.emoji} />}
        <div ref={bottomRef} />
      </main>

      {error && <p className="px-4 pb-1 text-sm font-semibold text-speak-red">{error}</p>}

      <footer className="border-t-2 border-speak-border bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Reply to ${persona.name.toLowerCase()}...`}
            rows={1}
            disabled={sending}
            className="max-h-28 flex-1 resize-none rounded-2xl border-2 border-speak-border px-4 py-2.5 text-[15px] focus:border-speak-blue focus:outline-none disabled:bg-speak-bg"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="btn-duo-green !rounded-full !p-0 h-11 w-11 flex-shrink-0 text-lg"
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </footer>

      {confirmEnd && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6" onClick={() => !ending && setConfirmEnd(false)}>
          <div className="animate-pop w-full max-w-sm rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-extrabold">End this session?</h3>
            <p className="mb-5 text-sm text-speak-muted">
              We'll analyze your conversation and generate a progress report with feedback.
            </p>
            <div className="flex gap-3">
              <button className="btn-duo-outline flex-1" onClick={() => setConfirmEnd(false)} disabled={ending}>
                Keep talking
              </button>
              <button className="btn-duo-red flex-1" onClick={endSession} disabled={ending}>
                {ending ? "Ending..." : "End & get report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
