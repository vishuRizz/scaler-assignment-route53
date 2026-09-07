import {
  AUTH_STORAGE_KEYS,
  DEMO_CREDENTIALS,
  type AuthMethod,
  type AuthSession,
  type StoredUser,
} from "./types";

function formatAccountId(id: string): string {
  const digits = id.replace(/\D/g, "").padStart(12, "0").slice(0, 12);
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

function generateAccountId(): string {
  let id = "";
  for (let i = 0; i < 12; i += 1) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.users);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_STORAGE_KEYS.users, JSON.stringify(users));
}

export function ensureDemoUser(): StoredUser {
  const users = readUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase(),
  );
  if (existing) return existing;

  const demo: StoredUser = {
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
    accountId: DEMO_CREDENTIALS.accountId,
    displayName: DEMO_CREDENTIALS.displayName,
    accountIdFormatted: formatAccountId(DEMO_CREDENTIALS.accountId),
    createdAt: new Date().toISOString(),
  };
  writeUsers([demo, ...users]);
  return demo;
}

export function listUsers(): StoredUser[] {
  ensureDemoUser();
  return readUsers();
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return listUsers().find((u) => u.email.toLowerCase() === normalized);
}

export function findUserByAccountAndName(
  accountId: string,
  userName: string,
): StoredUser | undefined {
  const id = accountId.replace(/\D/g, "");
  const name = userName.trim().toLowerCase();
  return listUsers().find(
    (u) =>
      u.accountId === id &&
      (u.displayName.toLowerCase() === name ||
        u.email.toLowerCase().startsWith(`${name}@`)),
  );
}

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

export function registerUser(input: RegisterInput): StoredUser {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new Error("Email and password are required.");
  }
  if (findUserByEmail(email)) {
    throw new Error("An account with this email already exists.");
  }

  const accountId = generateAccountId();
  const displayName =
    input.displayName.trim() || email.split("@")[0] || "aws-user";

  const user: StoredUser = {
    email,
    password: input.password,
    accountId,
    displayName,
    accountIdFormatted: formatAccountId(accountId),
    createdAt: new Date().toISOString(),
  };
  writeUsers([user, ...readUsers()]);
  return user;
}

function toSession(user: StoredUser, method: AuthMethod): AuthSession {
  return {
    email: user.email,
    accountId: user.accountId,
    displayName: user.displayName,
    accountIdFormatted: user.accountIdFormatted,
    method,
    signedInAt: new Date().toISOString(),
  };
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.session);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_STORAGE_KEYS.session, JSON.stringify(session));
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.session);
}

export function signInRoot(email: string, password: string): AuthSession {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error(
      "Your authentication information is incorrect. Please try again.",
    );
  }
  const session = toSession(user, "root");
  setSession(session);
  return session;
}

export function signInIam(
  accountId: string,
  userName: string,
  password: string,
): AuthSession {
  const user = findUserByAccountAndName(accountId, userName);
  if (!user || user.password !== password) {
    throw new Error(
      "Your authentication information is incorrect. Please try again.",
    );
  }
  const session = toSession(user, "iam");
  setSession(session);
  return session;
}

export function signOut(): void {
  clearSession();
}
