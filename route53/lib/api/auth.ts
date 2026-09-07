import { apiFetch } from "@/lib/api/client";
import {
  buildSession,
  clearAuthStorage,
  getToken,
  persistAuth,
} from "@/lib/auth/session-storage";
import type { AuthMethod, AuthSession } from "@/lib/auth/types";

export type ApiUser = {
  email: string;
  display_name: string;
  account_id: string;
  account_id_formatted: string;
};

type AuthResponse = {
  token: string;
  user: ApiUser;
};

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

function saveAuth(response: AuthResponse, method: AuthMethod): AuthSession {
  const session = buildSession(response.user, method, response.token);
  persistAuth(response.token, session);
  return session;
}

export async function loginRoot(
  email: string,
  password: string,
): Promise<AuthSession> {
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email: email.trim(), password, method: "root" },
  });
  return saveAuth(response, "root");
}

export async function loginIam(
  accountId: string,
  userName: string,
  password: string,
): Promise<AuthSession> {
  const response = await apiFetch<AuthResponse>("/auth/login/iam", {
    method: "POST",
    body: {
      account_id: accountId.trim(),
      user_name: userName.trim(),
      password,
    },
  });
  return saveAuth(response, "iam");
}

export async function registerAccount(
  input: RegisterInput,
): Promise<AuthSession> {
  const response = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: {
      email: input.email.trim(),
      password: input.password,
      display_name: input.displayName.trim(),
    },
  });
  return saveAuth(response, "root");
}

export async function fetchMe(): Promise<ApiUser> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return apiFetch<ApiUser>("/auth/me", { token });
}

export async function logoutRemote(): Promise<void> {
  const token = getToken();
  try {
    if (token) {
      await apiFetch<{ message: string }>("/auth/logout", {
        method: "POST",
        token,
      });
    }
  } catch {
    // Still clear local session if the API is unreachable.
  } finally {
    clearAuthStorage();
  }
}
