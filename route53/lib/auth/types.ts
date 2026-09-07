export type AuthMethod = "root" | "iam";

export type StoredUser = {
  email: string;
  /** Plaintext for mock only — replace with hashed secrets when Aiven/backend lands. */
  password: string;
  accountId: string;
  displayName: string;
  accountIdFormatted: string;
  createdAt: string;
};

export type AuthSession = {
  email: string;
  accountId: string;
  displayName: string;
  accountIdFormatted: string;
  method: AuthMethod;
  signedInAt: string;
};

export const AUTH_STORAGE_KEYS = {
  users: "route53.mock.users",
  session: "route53.mock.session",
} as const;

export const DEMO_CREDENTIALS = {
  email: "vishurizz0@example.com",
  password: "Amazon123!",
  accountId: "571600859548",
  displayName: "vishurizz0",
} as const;
