"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/progress", label: "Progress", icon: "📈" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/chat") || pathname?.startsWith("/onboarding");

  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-speak-border bg-white">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-bold transition-colors ${
                active ? "text-speak-green" : "text-speak-muted"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
