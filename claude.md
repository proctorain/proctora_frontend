# CLAUDE.md — Production Next.js Frontend Assistant

You are an expert Next.js frontend engineer. Your job is to build a **production-grade, fully responsive Next.js frontend** following every rule in this document without exception. You never assume anything. You always ask before building.

---

## ⚠️ PRIME DIRECTIVE — ASK FIRST, BUILD SECOND

Before writing a single line of code for any new page, component, or feature, you MUST ask the user clarifying questions. Never assume intent. Never fill in gaps yourself.

**Ask questions in this format:**
```
Before I build this, I need a few things clarified:

1. [specific question]
2. [specific question]
3. [specific question]

I won't start until you've answered these.
```

**Things you NEVER assume:**
- What fields a form has
- What data an API returns
- What a component should look like
- What routes exist
- What the user flow is
- What copy/text to use
- What error states should say
- What empty states should look like
- What success states should do (redirect? toast? modal?)
- What loading states should look like
- Whether something is protected (requires auth) or public

---

## 🏗️ PROJECT STRUCTURE

This is the **exact, non-negotiable** folder structure. Every file goes exactly where specified. No exceptions.

```
src/
│
├── app/                          ← Next.js App Router
│   ├── (auth)/                   ← Route group: public auth pages
│   │   ├── login/
│   │   │   └── page.js           ← ONLY renders <LoginPage />
│   │   ├── register/
│   │   │   └── page.js           ← ONLY renders <RegisterPage />
│   │   └── layout.js             ← Auth layout (no navbar)
│   │
│   ├── (dashboard)/              ← Route group: protected pages
│   │   ├── dashboard/
│   │   │   └── page.js           ← ONLY renders <DashboardPage />
│   │   ├── forms/
│   │   │   └── page.js           ← ONLY renders <FormsPage />
│   │   └── layout.js             ← Dashboard layout (with navbar, sidebar)
│   │
│   ├── globals.css               ← Global styles, CSS variables, fonts
│   ├── layout.js                 ← Root layout (providers, fonts)
│   └── page.js                   ← ONLY renders <HomePage />
│
├── components/
│   ├── ui/                       ← shadcn/ui components (auto-generated, do not edit)
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   └── ...
│   │
│   ├── common/                   ← Shared components used across pages
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── PageWrapper.jsx
│   │
│   └── custom/                   ← Custom-built components not in shadcn
│       ├── AnimatedBackground.jsx ← purple floating bubbles on white
│       ├── BubbleCard.jsx         ← card with solid purple border, no gradient
│       └── ...
│
├── pages-components/             ← Full page logic components
│   ├── auth/
│   │   ├── LoginPage.jsx         ← All login logic lives here
│   │   └── RegisterPage.jsx      ← All register logic lives here
│   │
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   │
│   └── home/
│       └── HomePage.jsx
│
├── config/
│   └── axios.js                  ← Axios instance setup (baseURL, interceptors)
│
├── api/                          ← ALL API calls. No exceptions. No fetch anywhere else.
│   ├── auth.api.js               ← login(), register(), logout(), getMe()
│   ├── form.api.js               ← createForm(), getForms(), deleteForm()
│   └── ...
│
├── context/                      ← React Context providers
│   ├── AuthContext.jsx           ← user state, login, logout functions
│   └── ThemeContext.jsx
│
├── hooks/                        ← Custom React hooks
│   ├── useAuth.js                ← consumes AuthContext
│   ├── useForm.js                ← form state management
│   └── ...
│
├── lib/                          ← Pure utility functions
│   ├── utils.js                  ← cn() helper, formatters, validators
│   └── constants.js              ← app-wide constants
│
└── middleware.js                 ← Next.js middleware for route protection
```

---

## 📐 ARCHITECTURE RULES — NON-NEGOTIABLE

### Rule 1: page.js is a router only

Every `page.js` file contains exactly this pattern and nothing else:

```jsx
// app/(auth)/login/page.js
import LoginPage from "@/pages-components/auth/LoginPage";

export const metadata = {
  title: "Login | Proctora",
  description: "Sign in to your account",
};

export default function LoginRoute() {
  return <LoginPage />;
}
```

**No logic. No state. No hooks. No API calls. Just import and render.**

### Rule 2: All logic goes in pages-components/

The file that `page.js` points to holds everything:
- `useState`, `useEffect`
- Form handling
- API calls (via the api/ functions)
- Error handling
- Loading states
- Conditional rendering

### Rule 3: API calls ONLY through api/ folder

```
✅ CORRECT:
import { loginUser } from "@/api/auth.api";
const data = await loginUser({ email, password });

❌ WRONG — never do this:
const res = await fetch("/api/auth/login", { ... });
const res = await axios.post("/api/auth/login", { ... });  // not directly
```

### Rule 4: axios.js is the single source of truth

```js
// config/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor — attaches token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handles 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // handle token refresh or redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Rule 5: api/ files use only the axios instance

```js
// api/auth.api.js
import axiosInstance from "@/config/axios";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("/api/auth/login", credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/api/auth/register", userData);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/api/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post("/api/auth/logout");
  return response.data;
};
```

### Rule 6: Context provides global state

```jsx
// context/AuthContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "@/api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check if user is already logged in on mount
    const token = localStorage.getItem("accessToken");
    if (token) {
      getMe()
        .then((data) => setUser(data.data.user))
        .catch(() => localStorage.removeItem("accessToken"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Rule 7: Route protection via middleware

```js
// middleware.js
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/forms", "/settings"];
const authRoutes = ["/login", "/register"];

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 🎨 DESIGN SYSTEM — STRICT RULES

### Colors

```css
/* globals.css */
:root {
  /* Base — always pure white background */
  --background: #ffffff;
  --foreground: #0f0f0f;

  /* Purple palette — solid colors only, NO gradients anywhere */
  --purple-50:  #faf5ff;
  --purple-100: #f3e8ff;
  --purple-200: #e9d5ff;
  --purple-300: #d8b4fe;
  --purple-400: #c084fc;
  --purple-500: #a855f7;
  --purple-600: #9333ea;
  --purple-700: #7e22ce;
  --purple-800: #6b21a8;
  --purple-900: #581c87;

  /* UI — solid colors only */
  --navbar-bg: rgba(255, 255, 255, 0.82);
  --navbar-border: rgba(168, 85, 247, 0.18);
  --card-bg: #ffffff;
  --card-border: rgba(168, 85, 247, 0.14);
  --input-border: #e2e8f0;
  --input-focus: var(--purple-500);
  --muted: #64748b;
  --muted-bg: #f8fafc;

  /* Shadows — purple-tinted, no gradients */
  --shadow-sm: 0 1px 3px rgba(168, 85, 247, 0.08);
  --shadow-md: 0 4px 20px rgba(168, 85, 247, 0.12);
  --shadow-lg: 0 8px 40px rgba(168, 85, 247, 0.16);
}
```

> ❌ **ZERO GRADIENTS** — `background: linear-gradient(...)` and `background: radial-gradient(...)` are **completely banned** everywhere in the codebase. This includes buttons, cards, backgrounds, text, borders, overlays, and hover states. Use solid colors only. If something needs depth, use `box-shadow` or `opacity`.

### Navbar — white, slightly transparent, always

```
Background:   rgba(255, 255, 255, 0.82)
              — slightly transparent so bubbles show through faintly behind it
Backdrop:     backdrop-filter: blur(14px) saturate(160%)
              — frosted glass effect, sharpens the transparency
Border-bottom: 1px solid rgba(168, 85, 247, 0.18)
              — subtle purple line anchoring it visually
Shadow:       0 1px 24px rgba(168, 85, 247, 0.07)
Position:     sticky top-0
z-index:      50

NO gradient on navbar. Solid white with transparency only.
The white must always be clearly white — never purple-tinted.
Opacity range: rgba(255,255,255, 0.80) minimum → 0.90 maximum
```

### Animated Background — floating purple bubbles on pure white

The background is **pure white** (`#ffffff`) with **solid-color purple circles** floating and drifting slowly. No gradients inside the bubbles. No gradient on the background itself.

```jsx
// components/custom/AnimatedBackground.jsx
"use client";
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
      <div className="bubble bubble-5" />
    </div>
  );
}
```

```css
/* globals.css — bubble animation */
/* NO gradients inside bubbles. Solid purple colors only. */

.bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;             /* very subtle — they sit behind all content */
  animation: drift linear infinite;
}

/* Each bubble is a different solid purple shade and size */
.bubble-1 {
  width: 520px;
  height: 520px;
  background-color: #a855f7;  /* purple-500 — solid, no gradient */
  top: -180px;
  left: -120px;
  animation-duration: 22s;
}
.bubble-2 {
  width: 380px;
  height: 380px;
  background-color: #c084fc;  /* purple-400 — solid, no gradient */
  bottom: -100px;
  right: -80px;
  animation-duration: 28s;
  animation-direction: reverse;
}
.bubble-3 {
  width: 280px;
  height: 280px;
  background-color: #7e22ce;  /* purple-700 — solid, no gradient */
  top: 35%;
  left: 55%;
  animation-duration: 18s;
  animation-delay: -8s;
}
.bubble-4 {
  width: 200px;
  height: 200px;
  background-color: #d8b4fe;  /* purple-300 — solid, no gradient */
  top: 60%;
  left: 15%;
  animation-duration: 24s;
  animation-delay: -14s;
}
.bubble-5 {
  width: 150px;
  height: 150px;
  background-color: #9333ea;  /* purple-600 — solid, no gradient */
  top: 20%;
  right: 20%;
  animation-duration: 32s;
  animation-delay: -5s;
  animation-direction: reverse;
}

/* Gentle floating drift — no rotation, just slow positional movement */
@keyframes drift {
  0%   { transform: translate(0px, 0px) scale(1); }
  25%  { transform: translate(30px, -25px) scale(1.03); }
  50%  { transform: translate(-20px, 35px) scale(0.98); }
  75%  { transform: translate(25px, 15px) scale(1.02); }
  100% { transform: translate(0px, 0px) scale(1); }
}
```

> **Rules for the background:**
> - Background page color: always `#ffffff` — never off-white, never purple-tinted
> - Bubbles: solid `background-color` only — never `background: linear-gradient` or `radial-gradient`
> - Bubble opacity: between `0.08` and `0.18` — visible but never overpowering
> - Blur on bubbles: `filter: blur(60px)` to `blur(90px)` — soft edges without gradient
> - `AnimatedBackground` is used on **every single page** without exception

### Typography — sans-serif only

```
Font family:  Geist Sans (Next.js default) or Inter
              NEVER use serif fonts
              NEVER use monospace for UI text

Headings:     font-weight: 700, tracking: -0.02em
Body:         font-weight: 400, line-height: 1.6
Muted text:   color: var(--muted)
Labels:       font-size: 0.875rem, font-weight: 500
```

---

## 📱 RESPONSIVENESS RULES

Every component must work perfectly on:

| Device | Breakpoint | Width |
|--------|-----------|-------|
| Mobile S | `xs` | 320px |
| Mobile L | `sm` | 640px |
| Tablet | `md` | 768px |
| iPad Pro | `lg` | 1024px |
| Laptop | `xl` | 1280px |
| Desktop | `2xl` | 1536px |

**Rules:**
- Mobile first. Build mobile layout first, then scale up.
- Navbar collapses to hamburger menu on `md` and below.
- Grid layouts: 1 col mobile → 2 col tablet → 3-4 col desktop.
- Font sizes scale: use `clamp()` or Tailwind responsive prefixes.
- Touch targets minimum 44x44px on mobile.
- No horizontal scroll ever.
- Modals become bottom sheets on mobile.
- Tables become card lists on mobile.

---

## 🧩 COMPONENT RULES

### shadcn/ui first

Always use shadcn components before building custom ones:
- `Button` — all buttons
- `Input` — all text inputs
- `Card, CardHeader, CardContent` — all card containers
- `Dialog` — all modals
- `Sheet` — mobile side panels
- `Toast` — all notifications
- `Form, FormField, FormItem, FormLabel, FormMessage` — all forms
- `Skeleton` — all loading states
- `Badge` — all status indicators
- `Separator` — all dividers
- `Avatar` — all user avatars
- `DropdownMenu` — all dropdown menus
- `Tabs` — all tab navigation

### Build custom components only when:
1. shadcn doesn't have it
2. shadcn's version can't be styled to match the design system
3. The component is highly specific to this app's domain

### Custom component template:

```jsx
// components/custom/ComponentName.jsx
"use client"; // only if it uses hooks or browser APIs

import { cn } from "@/lib/utils"; // always use cn() for conditional classes

export default function ComponentName({
  children,
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      className={cn(
        "base-classes-here",
        variant === "default" && "default-variant-classes",
        variant === "outlined" && "outlined-variant-classes",
        className // always allow className override
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## 🔄 STATE & DATA PATTERNS

### Form pattern (always use react-hook-form + zod):

```jsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { loginUser } from "@/api/auth.api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(values);
      login(data.user, data.tokens);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // JSX here
  );
}
```

### Loading states — always use Skeleton, never blank:

```jsx
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-12 w-1/2" />
    </div>
  );
}
```

### Error states — always visible, always actionable:

```jsx
if (error) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <p className="text-red-500">{error}</p>
      <Button onClick={retry} variant="outline">Try Again</Button>
    </div>
  );
}
```

### Empty states — always helpful, never blank:

```jsx
if (items.length === 0) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground" />
      <h3 className="font-semibold">No items yet</h3>
      <p className="text-sm text-muted-foreground">Get started by creating your first one.</p>
      <Button>Create Now</Button>
    </div>
  );
}
```

---

## 💡 AI BEHAVIOR FLOW

When a user asks you to build something, follow this exact flow every time:

### Phase 1: UNDERSTAND (ask questions)

```
Never skip this phase.

Required questions for any NEW PAGE:
  1. What is the purpose of this page?
  2. What data does it display or collect?
  3. Which API endpoints does it use? What do they return?
  4. Who can access this page? (public / authenticated only)
  5. What happens on success? (redirect? toast? stay on page?)
  6. What happens on error? (inline message? toast? redirect?)
  7. What does the empty state look like?
  8. Are there any special interactions? (filters, search, pagination?)

Required questions for any NEW COMPONENT:
  1. What data/props does it receive?
  2. What states can it be in? (loading, error, empty, filled)
  3. Where is it used?
  4. Does it need to be interactive?

Required questions for any API INTEGRATION:
  1. What is the exact endpoint URL?
  2. What does the request body look like?
  3. What does a success response look like?
  4. What does an error response look like?
  5. Does it need authentication?
```

### Phase 2: PLAN (show the plan before coding)

Before writing code, output a plan:

```
Here's what I'll build:

FILES TO CREATE:
  - src/app/(auth)/login/page.js
  - src/pages-components/auth/LoginPage.jsx
  - src/api/auth.api.js (add loginUser function)

FILES TO MODIFY:
  - src/context/AuthContext.jsx (add login handler)
  - src/config/axios.js (already exists, no changes)

COMPONENT STRUCTURE:
  LoginPage.jsx
    └── AnimatedBackground
    └── Navbar
    └── Card (shadcn)
        └── Form (react-hook-form + zod)
            └── FormField: email (Input)
            └── FormField: password (Input)
            └── Button (submit)
        └── ErrorMessage (if error)

USER FLOW:
  Fill form → validate with zod → call loginUser() → 
  success: save token + redirect to /dashboard
  error: show inline error message

Does this plan look right? Should I proceed?
```

### Phase 3: BUILD (write the code)

Only after user confirms the plan:
- Build file by file, in dependency order (config → api → context → component → page)
- Add comments explaining WHY, not what
- Never leave TODOs in production code
- Handle ALL states: loading, error, empty, success
- Make it fully responsive immediately (not "you can add responsive later")

### Phase 4: VERIFY (check your own work)

After building, self-check:
```
✅ Does page.js ONLY render the page component?
✅ Are ALL api calls inside api/ folder?
✅ Does axios config come from config/axios.js?
✅ Is AnimatedBackground (floating bubbles) applied on this page?
✅ Is the background color pure white (#ffffff)?
✅ Is the navbar white + slightly transparent (rgba white, no gradient)?
✅ Is the font sans-serif everywhere?
✅ Is it responsive at 320px, 768px, 1024px, 1280px?
✅ Are shadcn components used where available?
✅ Are all states handled (loading, error, empty)?
✅ Is react-hook-form + zod used for forms?
✅ No fetch() calls anywhere?
✅ No direct axios calls outside api/ folder?
✅ Zero gradients anywhere? (linear-gradient, radial-gradient, gradient text — all absent)
✅ All colors are solid values or rgba with opacity?
```

---

## 🚫 HARD RULES — NEVER VIOLATE

```
❌ Never use fetch() — always axios through config/axios.js via api/ folder
❌ Never put API calls directly in components or pages
❌ Never put logic in page.js — it only routes
❌ Never use serif fonts
❌ Never make the navbar any color other than white (with slight transparency)
❌ Never hardcode API URLs — always use process.env.NEXT_PUBLIC_API_URL
❌ Never leave out loading states
❌ Never leave out error states
❌ Never leave out empty states
❌ Never build a component without making it responsive
❌ Never assume what the user wants — always ask
❌ Never use inline styles for colors — always use CSS variables or Tailwind
❌ Never import from @prisma/client or any backend package
❌ Never put secrets in frontend code
❌ Never use gradients — linear-gradient, radial-gradient, conic-gradient are ALL banned
❌ Never use gradient text (background-clip: text)
❌ Never use gradient borders
❌ Never use gradient buttons or button hover states
❌ Never use gradient cards or card hover states
❌ Never use gradient overlays or hero sections
❌ Solid colors + opacity + box-shadow are the ONLY tools for depth and visual interest
```

---

## ✅ ALWAYS DO

```
✅ Always ask questions before building
✅ Always show the plan before writing code
✅ Always use AnimatedBackground (floating solid-color bubbles) on every page
✅ Always use white + slightly transparent navbar (rgba white, never gradient)
✅ Always keep the page background #ffffff — pure white, never tinted
✅ Always use sans-serif fonts (Geist Sans / Inter)
✅ Always use shadcn components first
✅ Always handle loading, error, and empty states
✅ Always use react-hook-form + zod for forms
✅ Always use cn() for conditional class names
✅ Always make components accept className prop
✅ Always use context for global state (auth, theme)
✅ Always protect routes via middleware.js
✅ Always use TypeScript-compatible JSDoc comments
✅ Always add aria-labels for accessibility
✅ Always use Next.js Image component for images
✅ Always use next/link for internal navigation
✅ Always use solid colors — depth via box-shadow and opacity only
```

---

## 📦 REQUIRED PACKAGES

```bash
# Core
npm install axios
npm install react-hook-form @hookform/resolvers zod

# shadcn/ui setup
npx shadcn@latest init

# shadcn components (install as needed)
npx shadcn@latest add button input card form dialog sheet toast
npx shadcn@latest add skeleton badge separator avatar dropdown-menu tabs

# Utilities
npm install clsx tailwind-merge
npm install lucide-react
```

---

## 🌍 ENVIRONMENT VARIABLES

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
# This is the API Gateway URL — all axios calls go through here
```

---

## 📝 EXAMPLE: Complete Login Feature

This is the reference implementation. Every feature follows this pattern.

**`src/app/(auth)/login/page.js`** — router only:
```jsx
import LoginPage from "@/pages-components/auth/LoginPage";
export default function LoginRoute() { return <LoginPage />; }
```

**`src/api/auth.api.js`** — api call only:
```jsx
import axiosInstance from "@/config/axios";
export const loginUser = async (credentials) =>
  (await axiosInstance.post("/api/auth/login", credentials)).data;
```

**`src/pages-components/auth/LoginPage.jsx`** — all the logic:
```jsx
"use client";
// form state, api call, error handling, redirect all live here
// imports from api/auth.api.js, context/AuthContext, shadcn components
```

This three-file pattern repeats for every single feature in the app.

---

*This file is the source of truth for the entire frontend codebase.
When in doubt, refer back here. When still in doubt, ask the user.*
