"use client";

import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Flashbar, { type FlashbarProps } from "@cloudscape-design/components/flashbar";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConsoleShell } from "@/components/console";
import {
  deleteHostedZone,
  listHostedZones,
} from "@/lib/mock/hosted-zones";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { DeleteHostedZoneModal } from "./DeleteHostedZoneModal";
import { HostedZonesHeader } from "./HostedZonesHeader";
import { HostedZonesTable } from "./HostedZonesTable";
import styles from "./HostedZonesPage.module.css";

/**
 * Full Hosted zones page — shell + list matching desktop and phone screenshots.
 */
export function HostedZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [selectedItems, setSelectedItems] = useState<HostedZone[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<HostedZone | null>(null);
  const [flashItems, setFlashItems] = useState<FlashbarProps.MessageDefinition[]>(
    [],
  );

  useEffect(() => {
    setZones(listHostedZones());
  }, []);

  const refresh = useCallback(() => {
    setZones(listHostedZones());
    setSelectedItems([]);
  }, []);

  const goCreate = () => {
    router.push("/hosted-zones/create");
  };

  const selected = selectedItems[0];
  const hasSingleSelection = selectedItems.length === 1;
  const selectedCount = selectedItems.length;

  const handleDeleteConfirm = (zone: HostedZone) => {
    deleteHostedZone(zone.id);
    setDeleteTarget(null);
    refresh();
    setFlashItems([
      {
        type: "success",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setFlashItems([]),
        content: `Successfully deleted hosted zone ${zone.name}.`,
        id: "zone-deleted",
      },
    ]);
  };

  return (
    <ConsoleShell
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Route 53", href: "/hosted-zones" },
            { text: "Hosted zones", href: "/hosted-zones" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
    >
      <div className={styles.page}>
        {flashItems.length > 0 ? <Flashbar items={flashItems} /> : null}

        <div className={styles.headerBlock}>
          <HostedZonesHeader
            count={zones.length}
            hasSelection={hasSingleSelection}
            onRefresh={refresh}
            onCreate={goCreate}
            onViewDetails={() => {
              if (selected) router.push(`/hosted-zones/${selected.id}`);
            }}
            onEdit={() => {
              if (selected) router.push(`/hosted-zones/${selected.id}/edit`);
            }}
            onDelete={() => {
              if (selected) setDeleteTarget(selected);
            }}
          />

          <p className={styles.infoText}>
            Automatic mode is the current search behavior optimized for best
            filter results.{" "}
            <Link href="#" fontSize="body-s">
              To change modes go to settings.
            </Link>
          </p>
        </div>

        <HostedZonesTable
          items={zones}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onCreate={goCreate}
        />
      </div>

      <div className={styles.selectionBar} role="status">
        <span>
          {selectedCount} hosted zone{selectedCount === 1 ? "" : "s"} selected
        </span>
        <span className={styles.selectionChevron} aria-hidden>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
            <path
              d="M1 6.5L6 1.5l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>

      <DeleteHostedZoneModal
        zone={deleteTarget}
        visible={Boolean(deleteTarget)}
        onDismiss={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </ConsoleShell>
  );
}
