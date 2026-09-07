/**
 * Public runtime config (safe to expose in the browser).
 * Set NEXT_PUBLIC_API_URL in .env.local (dev) or Vercel env (prod).
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");
