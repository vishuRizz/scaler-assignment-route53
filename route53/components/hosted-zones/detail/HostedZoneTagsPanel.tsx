"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useMemo, useState } from "react";
import styles from "./HostedZoneDetailPage.module.css";

type TagRow = {
  id: string;
  key: string;
  value: string;
};

/**
 * Hosted zone tags tab — matched to AWS Route 53 console empty state.
 * Manage tags is UI-only (tags are not persisted in this clone).
 */
export function HostedZoneTagsPanel() {
  const [items] = useState<TagRow[]>([]);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        row.key.toLowerCase().includes(q) ||
        row.value.toLowerCase().includes(q),
    );
  }, [items, filter]);

  return (
    <Table
      variant="container"
      header={
        <Header
          variant="h2"
          actions={<Button onClick={() => undefined}>Manage tags</Button>}
        >
          Tags
        </Header>
      }
      columnDefinitions={[
        {
          id: "key",
          header: "Key",
          cell: (item) => item.key,
          sortingField: "key",
          isRowHeader: true,
        },
        {
          id: "value",
          header: "Value",
          cell: (item) => item.value,
          sortingField: "value",
        },
      ]}
      items={filtered}
      filter={
        <TextFilter
          filteringText={filter}
          filteringPlaceholder="Search"
          filteringAriaLabel="Search tags"
          onChange={({ detail }) => setFilter(detail.filteringText)}
        />
      }
      pagination={
        <Pagination
          currentPageIndex={1}
          pagesCount={1}
          ariaLabels={{
            nextPageLabel: "Next page",
            previousPageLabel: "Previous page",
            pageLabel: (pageNumber) => `Page ${pageNumber}`,
          }}
        />
      }
      empty={
        <div className={styles.tagsEmpty}>
          No tags associated with the resource.
        </div>
      }
    />
  );
}
