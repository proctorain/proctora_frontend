"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Navbar — Proctora branding left, search center, auth actions right.
 * Collapses to a hamburger menu on md and below.
 */
export default function Navbar({ className }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-[rgba(168,85,247,0.18)]",
        "shadow-[0_1px_24px_rgba(168,85,247,0.07)]",
        className
      )}
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
      aria-label="Main navigation"
    >
      {/* Desktop row */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left — brand */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-[#7e22ce]"
          aria-label="Proctora home"
        >
          Proctora
        </Link>

        {/* Center — search (hidden on mobile, visible md+) */}
        <div className="relative hidden flex-1 max-w-md md:flex">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a855f7]"
            size={16}
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-white border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)] placeholder:text-zinc-400"
            aria-label="Search"
          />
        </div>

        {/* Right — auth buttons (hidden on mobile) */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            asChild
            className="font-medium text-[#7e22ce] hover:bg-[rgba(168,85,247,0.08)] hover:text-[#7e22ce]"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)]"
          >
            <Link href="/register">Sign up</Link>
          </Button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="flex items-center justify-center rounded-md p-2 text-[#9333ea] md:hidden min-w-11 min-h-11"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="border-t border-[rgba(168,85,247,0.12)] px-4 pb-4 pt-3 md:hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
          {/* Mobile search */}
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a855f7]"
              size={16}
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 bg-white border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)] placeholder:text-zinc-400"
              aria-label="Search"
            />
          </div>

          {/* Mobile auth buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              asChild
              className="w-full justify-center font-medium text-[#7e22ce] hover:bg-[rgba(168,85,247,0.08)] hover:text-[#7e22ce] min-h-11"
            >
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-center bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11"
            >
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
