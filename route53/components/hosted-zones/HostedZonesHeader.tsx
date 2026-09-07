"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

type HostedZonesHeaderProps = {
  count: number;
  hasSelection: boolean;
  onRefresh: () => void;
  onCreate: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Page header row: title + View/Edit/Delete + Create hosted zone.
 */
export function HostedZonesHeader({
  count,
  hasSelection,
  onRefresh,
  onCreate,
  onViewDetails,
  onEdit,
  onDelete,
}: HostedZonesHeaderProps) {
  return (
    <Header
      variant="h1"
      counter={`(${count})`}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            iconName="refresh"
            ariaLabel="Refresh"
            onClick={onRefresh}
          />
          <Button disabled={!hasSelection} onClick={onViewDetails}>
            View details
          </Button>
          <Button disabled={!hasSelection} onClick={onEdit}>
            Edit
          </Button>
          <Button disabled={!hasSelection} onClick={onDelete}>
            Delete
          </Button>
          <Button variant="primary" onClick={onCreate}>
            Create hosted zone
          </Button>
        </SpaceBetween>
      }
    >
      Hosted zones
    </Header>
  );
}
