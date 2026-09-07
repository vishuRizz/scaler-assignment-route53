"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useRouter } from "next/navigation";
import { ConsolePage } from "@/components/console/ConsolePage";
import styles from "./ComingSoonPage.module.css";

export type ComingSoonPageProps = {
  title: string;
  description: string;
  breadcrumbItems: { text: string; href: string }[];
};

/**
 * Placeholder for Route 53 sections that are out of assignment scope.
 * Keeps console chrome + nav feel while marking the feature as unavailable.
 */
export function ComingSoonPage({
  title,
  description,
  breadcrumbItems,
}: ComingSoonPageProps) {
  const router = useRouter();

  return (
    <ConsolePage breadcrumbItems={breadcrumbItems}>
      <div className={styles.page}>
        <Header variant="h1">{title}</Header>

        <Container>
          <div className={styles.body}>
            <SpaceBetween size="m" alignItems="center">
              <StatusIndicator type="info">Coming soon</StatusIndicator>
              <Box variant="h2" textAlign="center">
                This feature isn&apos;t available in the clone yet
              </Box>
              <Box
                variant="p"
                color="text-body-secondary"
                textAlign="center"
              >
                <span className={styles.copy}>{description}</span> In the real
                AWS console this page manages live Route 53 resources. Here
                it&apos;s a placeholder so navigation matches the product
                experience.
              </Box>
              <Button
                variant="primary"
                onClick={() => router.push("/hosted-zones")}
              >
                Go to Hosted zones
              </Button>
            </SpaceBetween>
          </div>
        </Container>
      </div>
    </ConsolePage>
  );
}
