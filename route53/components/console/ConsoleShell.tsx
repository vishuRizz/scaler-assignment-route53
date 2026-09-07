"use client";

import AppLayout from "@cloudscape-design/components/app-layout";
import { useState, type ReactNode } from "react";
import { ConsoleFooter } from "@/components/console/ConsoleFooter/ConsoleFooter";
import { Route53SideNav } from "@/components/console/side-navigation/Route53SideNav";
import { TopNav } from "@/components/console/TopNav/TopNav";
import styles from "./ConsoleShell.module.css";

type ConsoleShellProps = {
  children: ReactNode;
  breadcrumbs?: ReactNode;
  notifications?: ReactNode;
  tools?: ReactNode;
  toolsOpen?: boolean;
  onToolsChange?: (open: boolean) => void;
  contentType?: "default" | "table" | "form" | "wizard" | "cards" | "dashboard";
};

/**
 * AWS Management Console chrome: top nav + AppLayout sidebar + footer.
 */
export function ConsoleShell({
  children,
  breadcrumbs,
  notifications,
  tools,
  toolsOpen = false,
  onToolsChange,
  contentType = "table",
}: ConsoleShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(true);

  return (
    <div className={styles.shell}>
      <TopNav />
      <div className={styles.body}>
        <AppLayout
          contentType={contentType}
          navigationOpen={navigationOpen}
          onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
          navigation={<Route53SideNav />}
          breadcrumbs={breadcrumbs}
          notifications={notifications}
          toolsHide={!tools}
          tools={tools}
          toolsOpen={toolsOpen}
          onToolsChange={
            onToolsChange
              ? ({ detail }) => onToolsChange(detail.open)
              : undefined
          }
          content={children}
          stickyNotifications
        />
      </div>
      <ConsoleFooter />
    </div>
  );
}
