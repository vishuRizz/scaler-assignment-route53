"use client";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Flashbar, { type FlashbarProps } from "@cloudscape-design/components/flashbar";
import Tabs from "@cloudscape-design/components/tabs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { DeleteHostedZoneModal } from "@/components/hosted-zones/DeleteHostedZoneModal";
import { DeleteRecordsModal } from "@/components/hosted-zones/records/DeleteRecordsModal";
import { peekHostedZone, peekRecords } from "@/lib/api/cache";
import { deleteHostedZone, getHostedZone } from "@/lib/api/hosted-zones";
import { deleteRecords, listRecords } from "@/lib/api/records";
import type { DnsRecord } from "@/lib/types/dns-record";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { HostedZoneDetailHeader } from "./HostedZoneDetailHeader";
import { HostedZoneDetailsExpandable } from "./HostedZoneDetailsExpandable";
import { RecordsTable } from "./RecordsTable";
import styles from "./HostedZoneDetailPage.module.css";

/**
 * Hosted zone detail — records view matching AWS Route 53 after create.
 */
export function HostedZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneId = params.id;

  const [zone, setZone] = useState<HostedZone | null | undefined>(() =>
    peekHostedZone(zoneId),
  );
  const [records, setRecords] = useState<DnsRecord[]>(
    () => peekRecords(zoneId) ?? [],
  );
  const [ready, setReady] = useState(() => Boolean(peekHostedZone(zoneId)));
  const [recordsLoading, setRecordsLoading] = useState(
    () => !peekRecords(zoneId),
  );
  const [showCreatedFlash, setShowCreatedFlash] = useState(false);
  const [showUpdatedFlash, setShowUpdatedFlash] = useState(false);
  const [showRecordCreatedFlash, setShowRecordCreatedFlash] = useState(false);
  const [showRecordDeletedFlash, setShowRecordDeletedFlash] = useState(false);
  const [deleteZoneOpen, setDeleteZoneOpen] = useState(false);
  const [recordsToDelete, setRecordsToDelete] = useState<DnsRecord[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(
    async (options?: { fresh?: boolean; showLoading?: boolean }) => {
      if (options?.showLoading || !peekRecords(zoneId)) {
        setRecordsLoading(true);
      }
      try {
        const [nextZone, nextRecords] = await Promise.all([
          getHostedZone(zoneId, { fresh: options?.fresh }),
          listRecords(zoneId, { fresh: options?.fresh }),
        ]);
        setZone(nextZone);
        setRecords(nextZone ? nextRecords : []);
        return nextZone;
      } finally {
        setRecordsLoading(false);
      }
    },
    [zoneId],
  );

  useEffect(() => {
    let cancelled = false;
    const cachedZone = peekHostedZone(zoneId);
    const cachedRecords = peekRecords(zoneId);
    if (cachedZone) {
      setZone(cachedZone);
      setRecords(cachedRecords ?? []);
      setReady(true);
      if (cachedRecords) setRecordsLoading(false);
    } else {
      setRecordsLoading(true);
    }

    void (async () => {
      try {
        const nextZone = await refresh({
          fresh: Boolean(cachedZone),
          showLoading: !cachedRecords,
        });
        if (cancelled) return;
        if (!nextZone && !cachedZone) setZone(null);
      } catch {
        if (!cancelled && !peekHostedZone(zoneId)) setZone(null);
      } finally {
        if (!cancelled) {
          setReady(true);
          setRecordsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh, zoneId]);

  useEffect(() => {
    const created = searchParams.get("created") === "1";
    const updated = searchParams.get("updated") === "1";
    const recordCreated = searchParams.get("recordCreated") === "1";
    if (created || updated || recordCreated) {
      if (created) setShowCreatedFlash(true);
      if (updated) setShowUpdatedFlash(true);
      if (recordCreated) setShowRecordCreatedFlash(true);
      router.replace(`/hosted-zones/${zoneId}`, { scroll: false });
    }
  }, [searchParams, zoneId, router]);

  const nameServers = useMemo(() => {
    const nsRecord = records.find((r) => r.type === "NS");
    return nsRecord?.value.split("\n").filter(Boolean) ?? [];
  }, [records]);

  const flashItems: FlashbarProps.MessageDefinition[] = useMemo(() => {
    if (!zone) return [];
    const items: FlashbarProps.MessageDefinition[] = [];
    if (showCreatedFlash) {
      items.push({
        type: "success",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setShowCreatedFlash(false),
        header: `${zone.name} was successfully created.`,
        content:
          "Now you can create records in the hosted zone to specify how you want Route 53 to route traffic for your domain.",
        id: "zone-created",
      });
    }
    if (showUpdatedFlash) {
      items.push({
        type: "success",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setShowUpdatedFlash(false),
        content: `Successfully updated hosted zone ${zone.name}.`,
        id: "zone-updated",
      });
    }
    if (showRecordCreatedFlash) {
      items.push({
        type: "success",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setShowRecordCreatedFlash(false),
        content: "Records were successfully created.",
        id: "records-created",
      });
    }
    if (showRecordDeletedFlash) {
      items.push({
        type: "success",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setShowRecordDeletedFlash(false),
        content: "Records were successfully deleted.",
        id: "records-deleted",
      });
    }
    if (actionError) {
      items.push({
        type: "error",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setActionError(null),
        content: actionError,
        id: "action-error",
      });
    }
    return items;
  }, [
    showCreatedFlash,
    showUpdatedFlash,
    showRecordCreatedFlash,
    showRecordDeletedFlash,
    actionError,
    zone,
  ]);

  const crumbs = [
    { text: "Route 53", href: "/hosted-zones" },
    { text: "Hosted zones", href: "/hosted-zones" },
    ...(zone
      ? [{ text: zone.name, href: `/hosted-zones/${zone.id}` }]
      : []),
  ];

  if (!ready && !zone) {
    return (
      <ConsolePage breadcrumbItems={crumbs}>
        <Box color="text-body-secondary">Loading...</Box>
      </ConsolePage>
    );
  }

  if (ready && !zone) {
    return (
      <ConsolePage breadcrumbItems={crumbs}>
        <Alert type="error" header="Hosted zone not found">
          This hosted zone does not exist or is no longer available.{" "}
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Back to Hosted zones
          </Button>
        </Alert>
      </ConsolePage>
    );
  }

  if (!zone) return null;

  return (
    <ConsolePage breadcrumbItems={crumbs}>
      <div className={styles.page}>
        {flashItems.length > 0 ? <Flashbar items={flashItems} /> : null}

        <HostedZoneDetailHeader
          zone={zone}
          onDelete={() => setDeleteZoneOpen(true)}
        />

        <HostedZoneDetailsExpandable
          zone={zone}
          nameServers={nameServers}
          onEdit={() => router.push(`/hosted-zones/${zone.id}/edit`)}
        />

        <Tabs
          tabs={[
            {
              id: "records",
              label: `Records (${records.length})`,
              content: (
                <RecordsTable
                  records={records}
                  loading={recordsLoading}
                  onRefresh={() =>
                    void refresh({ fresh: true, showLoading: true })
                  }
                  onCreate={() =>
                    router.push(`/hosted-zones/${zone.id}/records/create`)
                  }
                  onDeleteSelected={(selected) => setRecordsToDelete(selected)}
                />
              ),
            },
            {
              id: "accelerated-recovery",
              label: "Accelerated recovery",
              content: (
                <Box padding="l" color="text-body-secondary">
                  Accelerated recovery settings will appear here.
                </Box>
              ),
            },
            {
              id: "dnssec",
              label: "DNSSEC signing",
              content: (
                <Box padding="l" color="text-body-secondary">
                  DNSSEC signing settings will appear here.
                </Box>
              ),
            },
            {
              id: "tags",
              label: "Hosted zone tags (0)",
              content: (
                <Box padding="l" color="text-body-secondary">
                  No tags associated with the resource.
                </Box>
              ),
            },
          ]}
        />
      </div>

      <DeleteHostedZoneModal
        zone={zone}
        visible={deleteZoneOpen}
        onDismiss={() => setDeleteZoneOpen(false)}
        onConfirm={(target) => {
          void (async () => {
            try {
              await deleteHostedZone(target.id);
              setDeleteZoneOpen(false);
              router.push("/hosted-zones");
            } catch (err) {
              setActionError(
                err instanceof Error
                  ? err.message
                  : "Failed to delete hosted zone.",
              );
            }
          })();
        }}
      />

      <DeleteRecordsModal
        records={recordsToDelete}
        visible={recordsToDelete.length > 0}
        onDismiss={() => setRecordsToDelete([])}
        onConfirm={(selected) => {
          void (async () => {
            try {
              await deleteRecords(
                zone.id,
                selected.map((record) => record.id),
              );
              setRecordsToDelete([]);
              setShowRecordDeletedFlash(true);
              await refresh({ fresh: true });
            } catch (err) {
              setActionError(
                err instanceof Error
                  ? err.message
                  : "Failed to delete records.",
              );
            }
          })();
        }}
      />
    </ConsolePage>
  );
}
