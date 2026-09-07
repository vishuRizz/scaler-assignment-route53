"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import { ConsolePage } from "@/components/console/ConsolePage";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import styles from "./ComingSoonPage.module.css";

export type ComingSoonPageProps = {
  title: string;
  description: string;
  breadcrumbItems: { text: string; href: string }[];
};

function ComingSoonGlyph() {
  return (
    <svg
      className={styles.glyph}
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="56"
        height="56"
        rx="12"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M36 22v18M36 48h.02"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="36" cy="36" r="26" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    </svg>
  );
}

/**
 * Placeholder for Route 53 sections outside assignment scope.
 */
export function ComingSoonPage({
  title,
  description,
  breadcrumbItems,
}: ComingSoonPageProps) {
  const router = useRouter();

  return (
    <ConsolePage breadcrumbItems={breadcrumbItems}>
      <div className={styles.page}>
        <div className={styles.titleRow}>
          <Header variant="h1">{title}</Header>
          <Link href="#" variant="info" fontSize="body-s">
            Info
          </Link>
        </div>

        <section className={styles.panel} aria-labelledby="coming-soon-heading">
          <div className={styles.panelInner}>
            <div className={styles.iconWrap}>
              <ComingSoonGlyph />
            </div>

            <span className={styles.badge}>Coming soon</span>

            <h2 id="coming-soon-heading" className={styles.heading}>
              {title} isn&apos;t available in this clone
            </h2>

            <p className={styles.copy}>{description}</p>

            <p className={styles.note}>
              Navigation matches the AWS Route 53 console so the product layout
              stays familiar. Core assignment features — hosted zones and DNS
              records — are fully implemented.
            </p>

            <ul className={styles.hints}>
              <li>Manage domains and records under Hosted zones</li>
              <li>Review account summary on the Dashboard</li>
              <li>Use search (Option+S) to jump between console pages</li>
            </ul>

            <div className={styles.actions}>
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="primary"
                  onClick={() => router.push("/hosted-zones")}
                  style={awsPrimaryButtonStyle}
                >
                  Go to Hosted zones
                </Button>
                <Button onClick={() => router.push("/dashboard")}>
                  Open Dashboard
                </Button>
              </SpaceBetween>
            </div>
          </div>
        </section>
      </div>
    </ConsolePage>
  );
}
