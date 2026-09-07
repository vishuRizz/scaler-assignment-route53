"use client";

import Badge from "@cloudscape-design/components/badge";
import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type { HostedZone } from "@/lib/types/hosted-zone";
import styles from "./HostedZoneDetailPage.module.css";

type HostedZoneDetailHeaderProps = {
  zone: HostedZone;
  onDelete: () => void;
};

export function HostedZoneDetailHeader({
  zone,
  onDelete,
}: HostedZoneDetailHeaderProps) {
  return (
    <div className={styles.headerRow}>
      <div className={styles.titleBlock}>
        <Badge color="blue">{zone.type}</Badge>
        <h1 className={styles.zoneTitle}>{zone.name}</h1>
        <Link href="#" fontSize="body-s" className={styles.infoLink}>
          Info
        </Link>
      </div>
      <SpaceBetween direction="horizontal" size="xs">
        <Button onClick={onDelete}>Delete zone</Button>
        <Button>Test record</Button>
        <Button>Configure query logging</Button>
      </SpaceBetween>
    </div>
  );
}
