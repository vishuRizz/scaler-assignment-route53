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
          background: "#232f3e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d5dbdb",
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return children;
}
