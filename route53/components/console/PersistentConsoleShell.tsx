"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BreadcrumbStrip } from "@/components/console/BreadcrumbStrip/BreadcrumbStrip";
import { ConsoleFooter } from "@/components/console/ConsoleFooter/ConsoleFooter";
import { Route53SideNav } from "@/components/console/side-navigation/Route53SideNav";
import { TopNav } from "@/components/console/TopNav/TopNav";
import { AmazonQSidebar } from "@/components/console/amazon-q/AmazonQSidebar";
import {
  ConsoleChromeProvider,
  useConsoleChromeContext,
} from "@/lib/console/ConsoleChromeContext";
import { useAmazonQ } from "@/lib/amazon-q/AmazonQContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { APP_NAME } from "@/lib/constants/console";
import styles from "./ConsoleShell.module.css";

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isPhone;
}

function ContentAuthGate({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) {
      router.replace("/signin");
    }
  }, [ready, session, router]);

  if (!ready) {
    return (
      <div className={styles.contentLoading} role="status" aria-live="polite">
        {/* Keep shell chrome; avoid a second full-page loading flash */}
      </div>
    );
  }

  if (!session) return null;

  return children;
}

function ConsoleShellInner({ children }: { children: ReactNode }) {
  const { chrome } = useConsoleChromeContext();
  const { open: amazonQOpen } = useAmazonQ();
  const router = useRouter();
  const {
    breadcrumbs,
    contentType = "default",
    navigationOpenByDefault = true,
  } = chrome;

  const isPhone = useIsPhone();
  const [navigationOpen, setNavigationOpen] = useState(
    () => navigationOpenByDefault,
  );
  const prevNavDefault = useRef(navigationOpenByDefault);

  useLayoutEffect(() => {
    if (isPhone) {
      setNavigationOpen(false);
      prevNavDefault.current = navigationOpenByDefault;
      return;
    }
    // Only sync when the page's preferred default changes (e.g. list → form),
    // so we don't fight manual open/close mid-page.
    if (prevNavDefault.current !== navigationOpenByDefault) {
      setNavigationOpen(navigationOpenByDefault);
      prevNavDefault.current = navigationOpenByDefault;
    }
  }, [isPhone, navigationOpenByDefault]);

  const closeNav = () => setNavigationOpen(false);

  useEffect(() => {
    document.documentElement.classList.add("console-app");
    return () => document.documentElement.classList.remove("console-app");
  }, []);

  return (
    <div className={styles.shell}>
      <TopNav />

      <div className={styles.belowNav}>
        {amazonQOpen ? <AmazonQSidebar /> : null}

        <div className={styles.mainColumn}>
          <BreadcrumbStrip
            breadcrumbs={breadcrumbs}
            navigationOpen={navigationOpen}
            onNavigationToggle={() => setNavigationOpen((open) => !open)}
            toolsOpen={false}
            onToolsToggle={undefined}
          />

          <div className={styles.workspace}>
            {navigationOpen ? (
              <>
                {isPhone ? (
                  <button
                    type="button"
                    className={styles.backdrop}
                    aria-label="Close navigation"
                    onClick={closeNav}
                  />
                ) : null}
                <aside
                  className={`${styles.sidebar}${isPhone ? ` ${styles.sidebarDrawer}` : ""}`}
                  aria-label={`${APP_NAME} navigation`}
                >
                  <div className={styles.sidebarHeader}>
                    <button
                      type="button"
                      className={styles.sidebarTitle}
                      onClick={() => {
                        if (isPhone) closeNav();
                        router.push("/hosted-zones");
                      }}
                    >
                      {APP_NAME}
                    </button>
                    <button
                      type="button"
                      className={styles.collapseButton}
                      aria-label="Close side navigation"
                      onClick={closeNav}
                    >
                      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden>
                        <path
                          d="M10 4L5.5 10L10 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.sidebarNav}>
                    <Route53SideNav onFollow={isPhone ? closeNav : undefined} />
                  </div>
                </aside>
              </>
            ) : null}

            <main
              className={`${styles.content}${contentType === "form" ? ` ${styles.contentForm}` : ""}`}
            >
              <ContentAuthGate>{children}</ContentAuthGate>
            </main>
          </div>
        </div>
      </div>

      <div className={styles.desktopFooter}>
        <ConsoleFooter />
      </div>
    </div>
  );
}

/**
 * Persistent console chrome for Route 53 pages (layout-level).
 * TopNav / sidebar / footer stay mounted across route changes.
 */
export function PersistentConsoleShell({ children }: { children: ReactNode }) {
  return (
    <ConsoleChromeProvider>
      <ConsoleShellInner>{children}</ConsoleShellInner>
    </ConsoleChromeProvider>
  );
}
