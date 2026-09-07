"use client";

import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import { ConsoleShell } from "@/components/console";

/**
 * Temporary stub — create form comes next after list page is pixel-approved.
 */
export default function CreateHostedZonePage() {
  return (
    <ConsoleShell contentType="form">
      <Box padding="l">
        <Header variant="h1">Create hosted zone</Header>
        <Box variant="p" color="text-body-secondary" margin={{ top: "m" }}>
          Form UI coming next — list page first for visual sign-off.
        </Box>
      </Box>
    </ConsoleShell>
  );
}
