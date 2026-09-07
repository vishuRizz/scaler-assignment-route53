"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CollectionPreferences, {
  type CollectionPreferencesProps,
} from "@cloudscape-design/components/collection-preferences";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table, { type TableProps } from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import styles from "./HealthChecksPage.module.css";

export type HealthCheck = {
  id: string;
  name: string;
  details: string;
};

const COLUMN_DEFINITIONS: TableProps.ColumnDefinition<HealthCheck>[] = [
  {
    id: "id",
    header: "ID",
    cell: (item) => item.id,
    sortingField: "id",
    isRowHeader: true,
  },
  {
    id: "name",
    header: "Name",
    cell: (item) => item.name,
    sortingField: "name",
  },
  {
    id: "details",
    header: "Details",
    cell: (item) => item.details || "—",
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => "—",
  },
];

/**
 * Route 53 Health checks list — empty-state UI matching the AWS console.
 */
export function HealthChecksPage() {
  const [items] = useState<HealthCheck[]>([]);
  const [selectedItems, setSelectedItems] = useState<HealthCheck[]>([]);
  const [preferences, setPreferences] =
    useState<CollectionPreferencesProps.Preferences>({ pageSize: 20 });

  const {
    items: collectionItems,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
    actions,
  } = useCollection(items, {
    filtering: {
      empty: <HealthChecksEmptyState onCreate={() => undefined} />,
      noMatch: (
        <Box textAlign="center" color="inherit" padding="xxl">
          <SpaceBetween size="m">
            <b>No matches</b>
            <Button onClick={() => actions.setFiltering("")}>Clear filter</Button>
          </SpaceBetween>
        </Box>
      ),
    },
    pagination: { pageSize: preferences.pageSize },
    sorting: {},
    selection: {},
  });

  const selectedCount = selectedItems.length;

  return (
    <ConsolePage
      breadcrumbItems={[
        { text: "Route 53", href: "/hosted-zones" },
        { text: "Health checks", href: "/health-checks" },
      ]}
    >
      <div className={styles.page}>
        <Header
          variant="h1"
          counter={`(${items.length})`}
          info={
            <Link href="#" fontSize="body-s">
              Info
            </Link>
          }
          description="Route 53 health checks monitor the health and performance of your application's servers and endpoints."
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={() => undefined}
              />
              <Button variant="primary" style={awsPrimaryButtonStyle}>
                Create health check
              </Button>
            </SpaceBetween>
          }
        >
          Health checks
        </Header>

        <Table
          {...collectionProps}
          variant="full-page"
          stickyHeader
          resizableColumns
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) =>
            setSelectedItems(detail.selectedItems)
          }
          columnDefinitions={COLUMN_DEFINITIONS}
          items={collectionItems}
          trackBy="id"
          loadingText="Loading health checks"
          empty={<HealthChecksEmptyState onCreate={() => undefined} />}
          filter={
            <TextFilter
              {...filterProps}
              filteringPlaceholder="Find health check"
              filteringAriaLabel="Find health check"
              countText={
                filterProps.filteringText
                  ? `${filteredItemsCount} matches`
                  : undefined
              }
            />
          }
          pagination={<Pagination {...paginationProps} />}
          preferences={
            <CollectionPreferences
              title="Preferences"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              preferences={preferences}
              onConfirm={({ detail }) => setPreferences(detail)}
              pageSizePreference={{
                title: "Page size",
                options: [
                  { value: 10, label: "10 health checks" },
                  { value: 20, label: "20 health checks" },
                  { value: 50, label: "50 health checks" },
                ],
              }}
            />
          }
          ariaLabels={{
            selectionGroupLabel: "Health checks selection",
            allItemsSelectionLabel: () => "Select all health checks",
            itemSelectionLabel: (_data, item) => item.name || item.id,
          }}
        />
      </div>

      <div className={styles.selectionBar} role="status">
        <span>
          {selectedCount > 0
            ? `${selectedCount} health check${selectedCount === 1 ? "" : "s"} selected`
            : "Select a health check"}
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
    </ConsolePage>
  );
}

function HealthChecksEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Box textAlign="center" color="inherit" padding={{ top: "xxl", bottom: "xxl" }}>
      <SpaceBetween size="m">
        <Box color="text-body-secondary">No health checks to display.</Box>
        <Button onClick={onCreate}>Create health check</Button>
      </SpaceBetween>
    </Box>
  );
}
