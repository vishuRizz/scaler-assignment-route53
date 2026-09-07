"use client";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import { useState } from "react";
import styles from "./HostedZoneDetailPage.module.css";

type KskRow = {
  id: string;
  name: string;
  status: string;
  creationDate: string;
};

/**
 * DNSSEC signing tab — matched to AWS Route 53 hosted zone console.
 * Actions are UI-only; assignment scope does not require real DNSSEC.
 */
export function DnssecSigningPanel() {
  const [signing, setSigning] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [items] = useState<KskRow[]>([]);

  return (
    <div className={styles.dnssecStack}>
      <Container
        header={
          <Header
            variant="h2"
            info={
              <Link
                href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-configuring-dnssec.html"
                variant="info"
                target="_blank"
              >
                Info
              </Link>
            }
            actions={
              <Button
                disabled={signing}
                onClick={() => {
                  setSigning(true);
                  setAlertVisible(false);
                }}
              >
                Enable DNSSEC signing
              </Button>
            }
          >
            DNSSEC signing
          </Header>
        }
      >
        <SpaceBetween size="l">
          <div>
            <div className={styles.statusLabel}>DNSSEC signing status</div>
            <StatusIndicator type={signing ? "success" : "stopped"}>
              {signing ? "Signing" : "Not signing"}
            </StatusIndicator>
          </div>

          {!signing && alertVisible ? (
            <Alert
              type="info"
              dismissible
              onDismiss={() => setAlertVisible(false)}
              header="You have not enabled DNSSEC signing for this hosted zone"
            >
              To enable DNSSEC signing and have Route 53 create a key-signing
              key (KSK) for you, choose Enable DNSSEC signing. Next, you must
              establish a DNSSEC chain of trust for your hosted zone. You&apos;ll
              complete this step after you enable DNSSEC signing.
            </Alert>
          ) : null}
        </SpaceBetween>
      </Container>

      <Table
        variant="container"
        header={
          <Header
            variant="h2"
            info={
              <Link
                href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-configuring-dnssec-ksk.html"
                variant="info"
                target="_blank"
              >
                Info
              </Link>
            }
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button disabled>View details</Button>
                <Button>Switch to advanced view</Button>
              </SpaceBetween>
            }
          >
            Key-signing keys (KSKs)
          </Header>
        }
        columnDefinitions={[
          {
            id: "name",
            header: "Name",
            cell: (item) => item.name,
            sortingField: "name",
          },
          {
            id: "status",
            header: "Status",
            cell: (item) => item.status,
            sortingField: "status",
          },
          {
            id: "creationDate",
            header: "Creation date",
            cell: (item) => item.creationDate,
            sortingField: "creationDate",
          },
        ]}
        items={items}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            <span className={styles.dnssecEmpty}>
              No key-signing keys created.
            </span>
          </Box>
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
      />
    </div>
  );
}
