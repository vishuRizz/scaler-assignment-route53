"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { listHostedZones } from "@/lib/api/hosted-zones";
import { peekZoneList } from "@/lib/api/cache";
import styles from "./DashboardPage.module.css";

type NotificationRow = {
  id: string;
  resource: string;
  status: string;
  lastUpdate: string;
};

/**
 * Route 53 Dashboard — summary tiles, domain check, and notifications.
 * Layout matched to the AWS Console dashboard screenshot.
 */
export function DashboardPage() {
  const router = useRouter();
  const [zoneCount, setZoneCount] = useState(
    () => peekZoneList()?.length ?? 0,
  );
  const [domain, setDomain] = useState("");
  const [domainHint, setDomainHint] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState("");
  const [notifications] = useState<NotificationRow[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const zones = await listHostedZones();
        if (!cancelled) setZoneCount(zones.length);
      } catch {
        /* keep cached count */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredNotifications = useMemo(() => {
    const q = notifFilter.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (row) =>
        row.resource.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [notifications, notifFilter]);

  const zoneLabel = zoneCount === 1 ? "Hosted zone" : "Hosted zones";

  const checkDomain = () => {
    const value = domain.trim().toLowerCase();
    if (!value) {
      setDomainHint("Enter a domain name to check availability.");
      return;
    }
    const labelOk = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.?$/i.test(
      value,
    );
    if (!labelOk || value.length > 255) {
      setDomainHint(
        "Domain name format is invalid. Check the rules below and try again.",
      );
      return;
    }
    setDomainHint(
      `Availability check for “${value}” isn’t connected in this clone. Use Hosted zones to manage DNS.`,
    );
  };

  return (
    <ConsolePage
      breadcrumbItems={[
        { text: "Route 53", href: "/hosted-zones" },
        { text: "Dashboard", href: "/dashboard" },
      ]}
      contentType="dashboard"
    >
      <div className={styles.page}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Route 53 Dashboard</h1>
          <Link
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html"
            target="_blank"
            variant="info"
            ariaLabel="Info"
          >
            Info
          </Link>
        </div>

        {/* Summary 2×2 */}
        <section className={styles.card} aria-label="Route 53 summary">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCell}>
              <h2 className={styles.cellTitle}>DNS management</h2>
              <button
                type="button"
                className={styles.statBlock}
                onClick={() => router.push("/hosted-zones")}
              >
                <span className={styles.statValue}>{zoneCount}</span>
                <span className={styles.statLabel}>{zoneLabel}</span>
              </button>
            </div>

            <div className={`${styles.summaryCell} ${styles.summaryCellRight}`}>
              <h2 className={styles.cellTitle}>Availability monitoring</h2>
              <p className={styles.cellCopy}>
                Health checks monitor your applications and web resources, and
                direct DNS queries to healthy resources.
              </p>
              <div className={styles.cellAction}>
                <Button onClick={() => router.push("/health-checks")}>
                  Create health check
                </Button>
              </div>
            </div>

            <div className={`${styles.summaryCell} ${styles.summaryCellBottom}`}>
              <h2 className={styles.cellTitle}>Traffic management</h2>
              <p className={styles.cellCopy}>
                A visual tool that lets you easily create policies for multiple
                endpoints in complex configurations.
              </p>
              <div className={styles.cellAction}>
                <Button onClick={() => router.push("/traffic-policies")}>
                  Create policy
                </Button>
              </div>
            </div>

            <div
              className={`${styles.summaryCell} ${styles.summaryCellRight} ${styles.summaryCellBottom}`}
            >
              <h2 className={styles.cellTitle}>Domain registration</h2>
              <div className={styles.statBlockStatic}>
                <span className={styles.statError}>Error</span>
                <span className={styles.statLabel}>Domains</span>
              </div>
            </div>
          </div>
        </section>

        {/* Register domain */}
        <section className={styles.card} aria-label="Register domain">
          <h2 className={styles.sectionTitle}>Register domain</h2>
          <p className={styles.sectionCopy}>
            Find and register an available domain, or{" "}
            <Link href="/domains/registered">transfer your existing domains</Link>{" "}
            to Route 53.
          </p>
          <label className={styles.domainField}>
            <span className={styles.srOnly}>Domain name</span>
            <input
              className={styles.domainInput}
              type="text"
              value={domain}
              placeholder="Enter a domain name"
              onChange={(e) => {
                setDomain(e.target.value);
                setDomainHint(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") checkDomain();
              }}
            />
          </label>
          <p className={styles.helper}>
            Each label (each part between dots) can be up to 63 characters long
            and must start with a-z or 0-9. Maximum length: 255 characters,
            including dots. Valid characters: a-z, 0-9, and - (hyphen)
          </p>
          {domainHint ? (
            <p className={styles.domainHint} role="status">
              {domainHint}
            </p>
          ) : null}
          <div className={styles.cellAction}>
            <Button onClick={checkDomain}>Check</Button>
          </div>
        </section>

        {/* Notifications */}
        <section className={styles.cardFlush} aria-label="Notifications">
          <Table
            variant="container"
            header={
              <Header
                variant="h2"
                actions={
                  <Button
                    iconName="refresh"
                    ariaLabel="Refresh"
                    onClick={() => setRefreshKey((k) => k + 1)}
                  />
                }
              >
                Notifications
              </Header>
            }
            columnDefinitions={[
              {
                id: "resource",
                header: "Resource",
                cell: (item) => item.resource,
                sortingField: "resource",
              },
              {
                id: "status",
                header: "Status",
                cell: (item) => item.status,
                sortingField: "status",
              },
              {
                id: "lastUpdate",
                header: "Last update",
                cell: (item) => item.lastUpdate,
                sortingField: "lastUpdate",
              },
            ]}
            items={filteredNotifications}
            loadingText="Loading notifications"
            empty={
              <div className={styles.emptyTable}>
                No notifications
              </div>
            }
            filter={
              <TextFilter
                filteringText={notifFilter}
                filteringPlaceholder="Find notifications"
                filteringAriaLabel="Find notifications"
                onChange={({ detail }) => setNotifFilter(detail.filteringText)}
              />
            }
            pagination={
              <Pagination
                currentPageIndex={1}
                pagesCount={1}
                ariaLabels={{
                  nextPageLabel: "Next page",
                  previousPageLabel: "Previous page",
                  pageLabel: (page) => `Page ${page}`,
                }}
              />
            }
          />
        </section>
      </div>
    </ConsolePage>
  );
}
