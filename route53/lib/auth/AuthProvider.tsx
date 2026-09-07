"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearApiCache } from "@/lib/api/cache";
import {
  fetchMe,
  loginIam,
  loginRoot,
  logoutRemote,
  registerAccount,
  type RegisterInput,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  clearAuthStorage,
  getStoredSession,
  getToken,
  persistAuth,
} from "@/lib/auth/session-storage";
import type { AuthSession } from "@/lib/auth/types";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  signInRoot: (email: string, password: string) => Promise<void>;
  signInIam: (
    accountId: string,
    userName: string,
    password: string,
  ) => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return "Your authentication information is incorrect. Please try again.";
    }
    return err.detail;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

function readOptimisticSession(): AuthSession | null {
  const token = getToken();
  const stored = getStoredSession();
  if (!token || !stored) return null;
  return { ...stored, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const token = getToken();
    const stored = getStoredSession();
    if (!token || !stored) {
      clearAuthStorage();
      clearApiCache();
      setSessionState(null);
      setReady(true);
      return;
    }

    if (!options?.silent) {
      setSessionState({ ...stored, token });
      setReady(true);
    }

    try {
      const me = await fetchMe();
      const next: AuthSession = {
        ...stored,
        token,
        email: me.email,
        accountId: me.account_id,
        displayName: me.display_name,
        accountIdFormatted: me.account_id_formatted,
      };
      persistAuth(token, next);
      setSessionState(next);
    } catch {
      clearAuthStorage();
      clearApiCache();
      setSessionState(null);
    } finally {
      setReady(true);
    }
  }, []);

  useLayoutEffect(() => {
    const optimistic = readOptimisticSession();
    if (optimistic) {
      setSessionState(optimistic);
      setReady(true);
      void refresh({ silent: true });
      return;
    }
    setReady(true);
  }, [refresh]);

  const signInRoot = useCallback(async (email: string, password: string) => {
    try {
      clearApiCache();
      const next = await loginRoot(email, password);
      setSessionState(next);
    } catch (err) {
      throw new Error(authErrorMessage(err));
    }
  }, []);

  const signInIam = useCallback(
    async (accountId: string, userName: string, password: string) => {
      try {
        clearApiCache();
        const next = await loginIam(accountId, userName, password);
        setSessionState(next);
      } catch (err) {
        throw new Error(authErrorMessage(err));
      }
    },
    [],
  );

  const register = useCallback(async (input: RegisterInput) => {
    try {
      clearApiCache();
      const next = await registerAccount(input);
      setSessionState(next);
      return next;
    } catch (err) {
      throw new Error(authErrorMessage(err));
    }
  }, []);

  const signOut = useCallback(async () => {
    await logoutRemote();
    clearApiCache();
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
