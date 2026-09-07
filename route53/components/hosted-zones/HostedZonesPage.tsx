"use client";

import Flashbar, { type FlashbarProps } from "@cloudscape-design/components/flashbar";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { peekZoneList } from "@/lib/api/cache";
import {
  deleteHostedZone,
  listHostedZones,
} from "@/lib/api/hosted-zones";
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
  const [zones, setZones] = useState<HostedZone[]>(() => peekZoneList() ?? []);
  const [selectedItems, setSelectedItems] = useState<HostedZone[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<HostedZone | null>(null);
  const [flashItems, setFlashItems] = useState<FlashbarProps.MessageDefinition[]>(
    [],
  );
  const [loading, setLoading] = useState(() => !peekZoneList());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cached = peekZoneList();
      if (cached) {
        setZones(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await listHostedZones({ fresh: Boolean(cached) });
        if (!cancelled) setZones(data);
      } catch (err) {
        if (!cancelled && !peekZoneList()?.length) {
          setError(
            err instanceof Error ? err.message : "Failed to load hosted zones.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goCreate = () => {
    router.push("/hosted-zones/create");
  };

  const selected = selectedItems[0];
  const hasSingleSelection = selectedItems.length === 1;
  const selectedCount = selectedItems.length;

  const handleDeleteConfirm = async (zone: HostedZone) => {
    try {
      await deleteHostedZone(zone.id);
      setDeleteTarget(null);
      setZones((prev) => prev.filter((item) => item.id !== zone.id));
      setSelectedItems([]);
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
    } catch (err) {
      setFlashItems([
        {
          type: "error",
          dismissible: true,
          dismissLabel: "Dismiss",
          onDismiss: () => setFlashItems([]),
          content:
            err instanceof Error ? err.message : "Failed to delete hosted zone.",
          id: "zone-delete-error",
        },
      ]);
    }
  };

  return (
    <ConsolePage
      breadcrumbItems={[
        { text: "Route 53", href: "/hosted-zones" },
        { text: "Hosted zones", href: "/hosted-zones" },
      ]}
    >
      <div className={styles.page}>
        {flashItems.length > 0 ? <Flashbar items={flashItems} /> : null}
        {error ? (
          <Flashbar
            items={[
              {
                type: "error",
                content: error,
                id: "zones-load-error",
                dismissible: true,
                onDismiss: () => setError(null),
              },
            ]}
          />
        ) : null}

        <div className={styles.headerBlock}>
          <HostedZonesHeader
            count={zones.length}
            hasSelection={hasSingleSelection}
            onRefresh={() => {
              void (async () => {
                setLoading(true);
                try {
                  const data = await listHostedZones({ fresh: true });
                  setZones(data);
                  setSelectedItems([]);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to load hosted zones.",
                  );
                } finally {
                  setLoading(false);
                }
              })();
            }}
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
          loading={loading}
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
        onConfirm={(zone) => void handleDeleteConfirm(zone)}
      />
    </ConsolePage>
  );
}
