"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ensureDemoUser,
  getSession,
  registerUser,
  signInIam as storageSignInIam,
  signInRoot as storageSignInRoot,
  signOut as storageSignOut,
  type RegisterInput,
} from "@/lib/auth/storage";
import type { AuthSession } from "@/lib/auth/types";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  signInRoot: (email: string, password: string) => void;
  signInIam: (accountId: string, userName: string, password: string) => void;
  register: (input: RegisterInput) => AuthSession;
  signOut: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    ensureDemoUser();
    setSessionState(getSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signInRoot = useCallback((email: string, password: string) => {
    const next = storageSignInRoot(email, password);
    setSessionState(next);
  }, []);

  const signInIam = useCallback(
    (accountId: string, userName: string, password: string) => {
      const next = storageSignInIam(accountId, userName, password);
      setSessionState(next);
    },
    [],
  );

  const register = useCallback((input: RegisterInput) => {
    const user = registerUser(input);
    const next = storageSignInRoot(user.email, input.password);
    setSessionState(next);
    return next;
  }, []);

  const signOut = useCallback(() => {
    storageSignOut();
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      ready,
      signInRoot,
      signInIam,
      register,
      signOut,
      refresh,
    }),
    [session, ready, signInRoot, signInIam, register, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
