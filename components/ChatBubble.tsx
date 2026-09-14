import { ChatMessage } from "@/lib/types";

export default function ChatBubble({ message, personaEmoji }: { message: ChatMessage; personaEmoji: string }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-speak-blue text-base">
          {personaEmoji}
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
          isUser
            ? "rounded-br-sm bg-speak-green text-white"
            : "rounded-bl-sm border-2 border-speak-border bg-white text-speak-ink"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
