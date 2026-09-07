"use client";

import Badge from "@cloudscape-design/components/badge";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type { HostedZone } from "@/lib/types/hosted-zone";
import styles from "./HostedZoneDetailPage.module.css";

type HostedZoneDetailHeaderProps = {
  zone: HostedZone;
};

export function HostedZoneDetailHeader({ zone }: HostedZoneDetailHeaderProps) {
  return (
    <div className={styles.headerRow}>
      <div className={styles.titleBlock}>
        <Badge color="blue">{zone.type}</Badge>
        <Header
          variant="h1"
          info={
            <Link href="#" fontSize="body-s">
              Info
            </Link>
          }
        >
          {zone.name}
        </Header>
      </div>
      <SpaceBetween direction="horizontal" size="xs">
        <Button>Delete zone</Button>
        <Button>Test record</Button>
        <Button>Configure query logging</Button>
      </SpaceBetween>
    </div>
  );
}
