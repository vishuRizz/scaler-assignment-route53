"use client";

import type { ReactNode } from "react";
import { PersistentConsoleShell } from "@/components/console/PersistentConsoleShell";

export default function HostedZonesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PersistentConsoleShell>{children}</PersistentConsoleShell>;
}
