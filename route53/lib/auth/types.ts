export type AuthMethod = "root" | "iam";

export type AuthSession = {
  token: string;
  email: string;
  accountId: string;
  displayName: string;
  accountIdFormatted: string;
  method: AuthMethod;
  signedInAt: string;
};

export const DEMO_CREDENTIALS = {
  email: "vishurizz0@example.com",
  password: "Amazon123!",
  accountId: "571600859548",
  displayName: "vishurizz0",
} as const;
