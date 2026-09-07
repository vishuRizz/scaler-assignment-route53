"use client";

import { useState, type ReactNode } from "react";
import { BreadcrumbStrip } from "@/components/console/BreadcrumbStrip/BreadcrumbStrip";
import { ConsoleFooter } from "@/components/console/ConsoleFooter/ConsoleFooter";
import { Route53SideNav } from "@/components/console/side-navigation/Route53SideNav";
import { TopNav } from "@/components/console/TopNav/TopNav";
import { APP_NAME } from "@/lib/constants/console";
import styles from "./ConsoleShell.module.css";

type ConsoleShellProps = {
  children: ReactNode;
  breadcrumbs?: ReactNode;
  tools?: ReactNode;
  /** Kept for API compatibility; layout is custom (not AppLayout). */
  contentType?: "default" | "table" | "form" | "wizard" | "cards" | "dashboard";
  notifications?: ReactNode;
};

/**
 * AWS Console chrome matching Route 53:
 * TopNav → full-width breadcrumb strip → sidebar (Route 53) | content → footer
 */
export function ConsoleShell({
  children,
  breadcrumbs,
  tools,
}: ConsoleShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <TopNav />

      <BreadcrumbStrip
        breadcrumbs={breadcrumbs}
        navigationOpen={navigationOpen}
        onNavigationToggle={() => setNavigationOpen((open) => !open)}
        toolsOpen={toolsOpen}
        onToolsToggle={tools ? () => setToolsOpen((open) => !open) : undefined}
      />

      <div className={styles.workspace}>
        {navigationOpen ? (
          <aside className={styles.sidebar} aria-label={`${APP_NAME} navigation`}>
            <div className={styles.sidebarHeader}>
              <a className={styles.sidebarTitle} href="/hosted-zones">
                {APP_NAME}
              </a>
              <button
                type="button"
                className={styles.collapseButton}
                aria-label="Close side navigation"
                onClick={() => setNavigationOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M10 3.5L5.5 8L10 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className={styles.sidebarNav}>
              <Route53SideNav />
            </div>
          </aside>
        ) : null}

        <main className={styles.content}>{children}</main>

        {tools && toolsOpen ? (
          <aside className={styles.tools} aria-label="Tools">
            {tools}
          </aside>
        ) : null}
      </div>

      <ConsoleFooter />
    </div>
  );
}
