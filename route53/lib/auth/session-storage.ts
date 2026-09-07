import type { AuthMethod, AuthSession } from "@/lib/auth/types";

export const AUTH_STORAGE_KEYS = {
  token: "route53.auth.token",
  session: "route53.auth.session",
} as const;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.token);
}

export function getStoredSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.session);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function persistAuth(token: string, session: AuthSession): void {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.session, JSON.stringify(session));
}

export function clearAuthStorage(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.session);
}

export function buildSession(
  user: {
    email: string;
    display_name: string;
    account_id: string;
    account_id_formatted: string;
  },
  method: AuthMethod,
  token: string,
): AuthSession {
  return {
    token,
    email: user.email,
    accountId: user.account_id,
    displayName: user.display_name,
    accountIdFormatted: user.account_id_formatted,
    method,
    signedInAt: new Date().toISOString(),
  };
}
