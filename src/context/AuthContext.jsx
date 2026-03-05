"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logoutUser } from "@/api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // null  = not yet checked
  // false = checked, not logged in
  // object = logged-in user
  const [loading, setLoading] = useState(true);

  // On mount, try to hydrate user from stored token
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setUser(false);
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data.user);
        // Sync the middleware cookie — missing for sessions that existed before
        // cookie support was added, or after a hard refresh clearing cookies.
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      })
      .catch(() => {
        setUser(false);
        document.cookie = "accessToken=; path=/; max-age=0; SameSite=Strict";
      })
      .finally(() => setLoading(false));
  }, []);

  /** Called by LoginPage after successful /login response */
  const login = useCallback(async (accessToken, refreshToken) => {
    // Save tokens first so the axios interceptor can attach them to getMe()
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // Set cookie so Next.js middleware can detect the session server-side
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      setUser(true); // logged in but profile fetch failed
    }
  }, []);

  /** Called by any page / Navbar on sign-out */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore — we clear locally regardless
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Strict";
      setUser(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
