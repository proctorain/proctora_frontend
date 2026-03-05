import { NextResponse } from "next/server";

// Routes that require a logged-in session
const protectedRoutes = ["/dashboard", "/forms", "/settings"];

// Routes only accessible when NOT logged in — redirect logged-in users away
const authOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Next.js middleware runs on the server — we can't access localStorage.
  // AuthContext sets this cookie on login and clears it on logout so the
  // middleware can always reflect the true session state.
  const token = request.cookies.get("accessToken")?.value;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthOnly  = authOnlyRoutes.some((r) => pathname.startsWith(r));

  // Not logged in trying to reach a protected page → send to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in trying to reach login/register/etc → send to home
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
