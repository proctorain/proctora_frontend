"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    Icon: LayoutDashboard,
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-16 flex h-[calc(100vh-4rem)] w-56 shrink-0 flex-col border-r border-[rgba(168,85,247,0.18)] bg-white/90 px-3 py-4 backdrop-blur sm:w-60"
      aria-label="Left sidebar"
    >
      <nav className="space-y-1.5" aria-label="Sidebar navigation">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[rgba(147,51,234,0.14)] text-[#7e22ce]"
                  : "text-zinc-600 hover:bg-[rgba(168,85,247,0.08)] hover:text-[#7e22ce]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
