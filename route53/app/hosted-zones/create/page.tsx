"use client";

import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Header from "@cloudscape-design/components/header";
import { ConsoleShell } from "@/components/console";

/**
 * Temporary stub — create form comes next after list page is pixel-approved.
 */
export default function CreateHostedZonePage() {
  return (
    <ConsoleShell
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Route 53", href: "/hosted-zones" },
            { text: "Hosted zones", href: "/hosted-zones" },
            { text: "Create hosted zone", href: "/hosted-zones/create" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
    >
      <Box>
        <Header variant="h1">Create hosted zone</Header>
        <Box variant="p" color="text-body-secondary" margin={{ top: "m" }}>
          Form UI coming next — list page first for visual sign-off.
        </Box>
      </Box>
    </ConsoleShell>
  );
}
