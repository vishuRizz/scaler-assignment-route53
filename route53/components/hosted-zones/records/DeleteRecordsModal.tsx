"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useEffect, useState } from "react";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import type { DnsRecord } from "@/lib/types/dns-record";

type DeleteRecordsModalProps = {
  records: DnsRecord[];
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (records: DnsRecord[]) => void;
};

/**
 * AWS-style delete selected record(s) confirmation with searchable preview table.
 */
export function DeleteRecordsModal({
  records,
  visible,
  onDismiss,
  onConfirm,
}: DeleteRecordsModalProps) {
  const [items, setItems] = useState<DnsRecord[]>([]);

  useEffect(() => {
    if (visible) setItems(records);
  }, [visible, records]);

  const {
    items: collectionItems,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(items, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="s">
          No records
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" color="inherit" padding="s">
          No matches
        </Box>
      ),
    },
    pagination: { pageSize: 10 },
    sorting: {},
  });

  const title =
    items.length === 1
      ? "Delete selected record?"
      : "Delete selected records?";

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header={title}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={items.length === 0}
              style={awsPrimaryButtonStyle}
              onClick={() => onConfirm(items)}
            >
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <Box variant="p">
          Delete the record permanently? This action cannot be undone. Your
          domain might become unavailable on the internet.
        </Box>

        <Table
          {...collectionProps}
          variant="container"
          columnDefinitions={[
            {
              id: "name",
              header: "Record name",
              cell: (item) => item.name,
              isRowHeader: true,
            },
            {
              id: "type",
              header: "Type",
              cell: (item) => item.type,
            },
            {
              id: "value",
              header: "Value/Route traffic to",
              cell: (item) => (
                <div style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
                  {item.value}
                </div>
              ),
            },
          ]}
          items={collectionItems}
          trackBy="id"
          filter={
            <TextFilter
              {...filterProps}
              filteringPlaceholder="Search"
              filteringAriaLabel="Search records to delete"
              countText={
                filterProps.filteringText
                  ? `${filteredItemsCount} matches`
                  : undefined
              }
            />
          }
          pagination={<Pagination {...paginationProps} />}
        />
      </SpaceBetween>
    </Modal>
  );
}
