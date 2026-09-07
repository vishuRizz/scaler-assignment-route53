"use client";

import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Box from "@cloudscape-design/components/box";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ConsoleShell } from "@/components/console";
import { listHostedZones } from "@/lib/mock/hosted-zones";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { HostedZonesHeader } from "./HostedZonesHeader";
import { HostedZonesTable } from "./HostedZonesTable";

/**
 * Full Hosted zones page — shell + list matching the screenshot.
 */
export function HostedZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>(() => listHostedZones());
  const [selectedItems, setSelectedItems] = useState<HostedZone[]>([]);

  const refresh = useCallback(() => {
    setZones(listHostedZones());
    setSelectedItems([]);
  }, []);

  const goCreate = () => {
    router.push("/hosted-zones/create");
  };

  const selected = selectedItems[0];
  const hasSingleSelection = selectedItems.length === 1;

  return (
    <ConsoleShell
      contentType="table"
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
      <SpaceBetween size="l">
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
            /* delete modal in next pass */
          }}
        />

        <Box color="text-body-secondary" fontSize="body-s">
          Automatic mode is the current search behavior optimized for best
          filter results.{" "}
          <Link href="#" fontSize="body-s">
            To change modes go to settings.
          </Link>
        </Box>

        <HostedZonesTable
          items={zones}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onCreate={goCreate}
        />
      </SpaceBetween>
    </ConsoleShell>
  );
}
