"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Redirects to /signin when there is no mock session.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) {
      router.replace("/signin");
    }
  }, [ready, session, router]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--aws-page-bg, #131920)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--aws-text-secondary, #aab7b8)",
          fontSize: 14,
        }}
        role="status"
        aria-live="polite"
      >
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return children;
}
