"use client";

import type { ReactNode } from "react";
import { PersistentConsoleShell } from "@/components/console/PersistentConsoleShell";
import { AmazonQProvider } from "@/lib/amazon-q/AmazonQContext";

/**
 * Shared console chrome for all Route 53 in-app pages
 * (hosted zones + Coming Soon placeholders).
 */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AmazonQProvider>
      <PersistentConsoleShell>{children}</PersistentConsoleShell>
    </AmazonQProvider>
  );
}
