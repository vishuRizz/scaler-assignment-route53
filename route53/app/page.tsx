"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? "/hosted-zones" : "/signin");
  }, [ready, session, router]);

  return null;
}
