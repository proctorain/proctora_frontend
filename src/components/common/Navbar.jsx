"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, LogOut, Home, LogIn, UserPlus, KeyRound, Lock, LayoutDashboard, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// ─── Searchable pages ────────────────────────────────────────────────────────
const ALL_PAGES = [
  { category: "Pages",     label: "Home",            description: "Landing page — overview of Proctora",                          href: "/",                Icon: Home,            tags: ["home", "landing", "start", "main", "welcome"] },
  { category: "Account",   label: "Log in",          description: "Sign in to your existing account",                             href: "/login",           Icon: LogIn,           tags: ["login", "log in", "signin", "sign in", "email", "password", "auth"] },
  { category: "Account",   label: "Sign up",         description: "Create a new Proctora account",                                href: "/register",        Icon: UserPlus,        tags: ["signup", "sign up", "register", "create account", "new account", "join"] },
  { category: "Account",   label: "Forgot password", description: "Send a password reset link to your email",                     href: "/forgot-password", Icon: KeyRound,        tags: ["forgot", "forgot password", "reset", "recover", "lost password"] },
  { category: "Account",   label: "Reset password",  description: "Set a new password using your reset link",                     href: "/reset-password",  Icon: Lock,            tags: ["reset", "reset password", "new password", "change password"] },
  { category: "Dashboard", label: "Dashboard",       description: "Your personal overview and exam stats (sign in required)",     href: "/dashboard",       Icon: LayoutDashboard, tags: ["dashboard", "overview", "stats", "summary"] },
  { category: "Dashboard", label: "My Forms",        description: "Create, manage and share exam forms (sign in required)",       href: "/forms",           Icon: FileText,        tags: ["forms", "exams", "tests", "quiz", "create exam"] },
  { category: "Dashboard", label: "Settings",        description: "Account preferences and security settings (sign in required)", href: "/settings",        Icon: Settings,        tags: ["settings", "preferences", "profile", "security"] },
];

// ─── SearchBox component ─────────────────────────────────────────────────────
function SearchBox({ onNavigate }) {
  const [query, setQuery]           = useState("");
  const [open, setOpen]             = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router       = useRouter();
  const containerRef = useRef(null);
  const inputRef     = useRef(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? ALL_PAGES.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      )
    : ALL_PAGES;

  // Group by category while preserving order
  const groups = filtered.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const go = useCallback(
    (href) => {
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      onNavigate?.();
      router.push(href);
    },
    [router, onNavigate],
  );

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      go(filtered[activeIndex].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a855f7] z-10 pointer-events-none"
        size={16}
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="pl-9 bg-white border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)] placeholder:text-zinc-400"
        aria-label="Search"
        aria-haspopup="listbox"
        aria-expanded={open && filtered.length > 0}
        autoComplete="off"
        spellCheck={false}
      />

      {open && filtered.length > 0 && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl border border-[rgba(168,85,247,0.15)] bg-white shadow-[0_8px_32px_rgba(147,51,234,0.14)] overflow-hidden"
          role="listbox"
        >
          {Object.entries(groups).map(([category, items], gi) => (
            <div key={category}>
              {gi > 0 && <div className="h-px bg-[rgba(168,85,247,0.1)] mx-3" />}
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#a855f7]">
                {category}
              </p>
              {items.map((item) => {
                const idx = filtered.indexOf(item);
                const active = idx === activeIndex;
                return (
                  <button
                    key={item.href}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => { e.preventDefault(); go(item.href); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      active ? "bg-[rgba(168,85,247,0.08)]" : "hover:bg-[rgba(168,85,247,0.04)]",
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                      active ? "bg-[rgba(168,85,247,0.18)]" : "bg-[rgba(168,85,247,0.07)]",
                    )}>
                      <item.Icon size={14} className="text-[#9333ea]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-800 leading-tight">{item.label}</p>
                      <p className="text-xs text-zinc-400 leading-tight mt-0.5 truncate">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono text-zinc-300">{item.href}</span>
                  </button>
                );
              })}
              <div className="h-1" />
            </div>
          ))}

          {/* Footer hint */}
          <div className="border-t border-[rgba(168,85,247,0.1)] bg-zinc-50/80 px-3 py-2 flex items-center gap-4">
            {[["↑↓", "navigate"], ["↵", "go"], ["Esc", "close"]].map(([key, hint]) => (
              <span key={key} className="flex items-center gap-1 text-[11px] text-zinc-400">
                <kbd className="rounded border border-zinc-200 bg-white px-1 py-0.5 text-[10px] font-mono text-zinc-500">{key}</kbd>
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Navbar — Proctora branding left, search center, auth actions right.
 * Shows Log in / Sign up when logged out; user email + Sign out when logged in.
 * Collapses to a hamburger menu on md and below.
 */
export default function Navbar({ className }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  // First letter of the email for the avatar
  const avatarLetter =
    user && typeof user === "object" && user.email
      ? user.email[0].toUpperCase()
      : null;

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-[rgba(168,85,247,0.18)]",
        "shadow-[0_1px_24px_rgba(168,85,247,0.07)]",
        className,
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

        {/* Center — search (hidden on mobile) */}
        <div className="hidden flex-1 max-w-md md:flex">
          <SearchBox onNavigate={() => setMenuOpen(false)} />
        </div>

        {/* Right — auth buttons (hidden on mobile), skeleton while loading */}
        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            // Thin placeholder to prevent layout shift
            <div className="h-9 w-32 rounded-md bg-[rgba(168,85,247,0.08)] animate-pulse" />
          ) : user ? (
            <>
              {avatarLetter && (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9333ea] text-white text-sm font-semibold select-none"
                  aria-label={`Signed in as ${user.email}`}
                  title={user.email}
                >
                  {avatarLetter}
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="font-medium text-[#7e22ce] hover:bg-[rgba(168,85,247,0.08)] hover:text-[#7e22ce] gap-1.5"
                aria-label="Sign out"
              >
                <LogOut size={15} />
                Sign out
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
          <div className="mb-3">
            <SearchBox onNavigate={() => setMenuOpen(false)} />
          </div>

          {/* Mobile auth */}
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="h-11 rounded-md bg-[rgba(168,85,247,0.08)] animate-pulse" />
            ) : user ? (
              <>
                {avatarLetter && (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9333ea] text-white text-sm font-semibold select-none"
                      aria-hidden="true"
                    >
                      {avatarLetter}
                    </div>
                    {user.email && (
                      <span className="text-sm text-zinc-400 truncate max-w-48">{user.email}</span>
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-center font-medium text-[#7e22ce] hover:bg-[rgba(168,85,247,0.08)] hover:text-[#7e22ce] min-h-11 gap-1.5"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                  Sign out
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
