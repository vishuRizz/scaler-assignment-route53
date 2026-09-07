"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useEffect, useState } from "react";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import type { HostedZone } from "@/lib/types/hosted-zone";

type DeleteHostedZoneModalProps = {
  zone: HostedZone | null;
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (zone: HostedZone) => void;
};

/**
 * AWS-style delete confirmation — Delete enabled only after typing "delete".
 */
export function DeleteHostedZoneModal({
  zone,
  visible,
  onDismiss,
  onConfirm,
}: DeleteHostedZoneModalProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (visible) setConfirmText("");
  }, [visible, zone?.id]);

  const canDelete = confirmText.trim().toLowerCase() === "delete";

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="medium"
      header={zone ? `Delete hosted zone ${zone.name}?` : "Delete hosted zone?"}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!canDelete || !zone}
              style={canDelete ? awsPrimaryButtonStyle : undefined}
              onClick={() => {
                if (zone && canDelete) onConfirm(zone);
              }}
            >
              Delete
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="l">
        <Box variant="p">
          Delete the hosted zone permanently? This action cannot be undone. Your
          domain might become unavailable on the internet.
        </Box>
        <hr style={{ border: 0, borderTop: "1px solid #e9ebed", margin: 0 }} />
        <SpaceBetween size="xs">
          <Box variant="p">
            To confirm that you want to delete the hosted zone, enter{" "}
            <em>delete</em> in the field.
          </Box>
          <Input
            value={confirmText}
            onChange={({ detail }) => setConfirmText(detail.value)}
            placeholder="delete"
            ariaLabel="Type delete to confirm"
          />
        </SpaceBetween>
      </SpaceBetween>
    </Modal>
  );
}
