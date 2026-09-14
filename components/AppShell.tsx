"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !(pathname?.startsWith("/chat") || pathname?.startsWith("/onboarding"));
  const isChat = pathname?.startsWith("/chat");

  return (
    <div
      className={`mx-auto flex max-w-lg flex-col ${
        isChat ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      } ${showNav ? "pb-20" : ""}`}
    >
      {children}
      {showNav && <BottomNav />}
    </div>
  );
}
