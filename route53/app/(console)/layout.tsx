"use client";

import type { ReactNode } from "react";
import { PersistentConsoleShell } from "@/components/console/PersistentConsoleShell";

/**
 * Shared console chrome for all Route 53 in-app pages
 * (hosted zones + Coming Soon placeholders).
 */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <PersistentConsoleShell>{children}</PersistentConsoleShell>;
}
