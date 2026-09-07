"use client";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useState } from "react";
import styles from "./HostedZoneDetailPage.module.css";

/**
 * Accelerated recovery tab — UI matched to AWS Route 53 console.
 * Enable is local-only (not persisted); assignment scope is zones/records.
 */
export function AcceleratedRecoveryPanel() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Container
      header={
        <Header
          variant="h2"
          info={
            <Link
              href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-accelerated-recovery.html"
              variant="info"
              target="_blank"
            >
              Info
            </Link>
          }
          actions={
            <Button
              disabled={enabled}
              onClick={() => setEnabled(true)}
            >
              {enabled ? "Enabled" : "Enable"}
            </Button>
          }
        >
          Accelerated recovery
        </Header>
      }
    >
      <SpaceBetween size="l">
        <p className={styles.acceleratedCopy}>
          Enable the accelerated recovery option to ensure that you can continue
          to make changes to your public DNS records after an impairment to US
          East (N. Virginia).
        </p>

        <div>
          <div className={styles.statusLabel}>Status</div>
          <StatusIndicator type={enabled ? "success" : "stopped"}>
            {enabled ? "Enabled" : "Disabled"}
          </StatusIndicator>
        </div>
      </SpaceBetween>
    </Container>
  );
}
