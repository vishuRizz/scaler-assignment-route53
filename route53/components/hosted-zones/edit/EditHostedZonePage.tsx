"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Textarea from "@cloudscape-design/components/textarea";
import Alert from "@cloudscape-design/components/alert";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { TagsSection } from "@/components/hosted-zones/create/CreateHostedZoneFormSections";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import { getHostedZone, updateHostedZone } from "@/lib/mock/hosted-zones";
import type { HostedZone } from "@/lib/types/hosted-zone";
import createStyles from "@/components/hosted-zones/create/CreateHostedZonePage.module.css";
import styles from "./EditHostedZonePage.module.css";

const DESCRIPTION_MAX = 256;

type Tag = { key: string; value: string };

function InfoLink() {
  return (
    <Link href="#" fontSize="body-s">
      Info
    </Link>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className={styles.readOnlyField}>
      <Box variant="awsui-key-label">{label}</Box>
      <div className={styles.readOnlyValue}>{value}</div>
    </div>
  );
}

/**
 * Edit hosted zone — description (and tags UI) matching AWS Route 53.
 */
export function EditHostedZonePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const zoneId = params.id;

  const [zone, setZone] = useState<HostedZone | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const found = getHostedZone(zoneId);
    setZone(found);
    setDescription(found?.description ?? "");
    setReady(true);
  }, [zoneId]);

  if (!ready) {
    return (
      <ConsolePage
        contentType="form"
        navigationOpenByDefault={false}
        breadcrumbItems={[
          { text: "Route 53", href: "/hosted-zones" },
          { text: "Hosted zones", href: "/hosted-zones" },
        ]}
      >
        <Box color="text-body-secondary">Loading...</Box>
      </ConsolePage>
    );
  }

  if (!zone) {
    return (
      <ConsolePage
        contentType="form"
        navigationOpenByDefault={false}
        breadcrumbItems={[
          { text: "Route 53", href: "/hosted-zones" },
          { text: "Hosted zones", href: "/hosted-zones" },
        ]}
      >
        <Alert type="error" header="Hosted zone not found">
          This hosted zone does not exist or was deleted.{" "}
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Back to Hosted zones
          </Button>
        </Alert>
      </ConsolePage>
    );
  }

  const goBack = () => router.push(`/hosted-zones/${zone.id}`);

  const handleSave = () => {
    setSaving(true);
    updateHostedZone(zone.id, { description });
    router.push(`/hosted-zones/${zone.id}?updated=1`);
  };

  const typeLabel =
    zone.type === "Public" ? "Public hosted zone" : "Private hosted zone";

  return (
    <ConsolePage
      contentType="form"
      navigationOpenByDefault={false}
      breadcrumbItems={[
        { text: "Route 53", href: "/hosted-zones" },
        { text: "Hosted zones", href: "/hosted-zones" },
        { text: zone.name, href: `/hosted-zones/${zone.id}` },
        { text: "Edit", href: `/hosted-zones/${zone.id}/edit` },
      ]}
    >
      <div className={createStyles.page}>
        <Header variant="h1" info={<InfoLink />}>
          Edit {zone.name}
        </Header>

        <div className={createStyles.stack}>
          <Container header={<Header variant="h2">Edit hosted zone</Header>}>
            <SpaceBetween size="l">
              <p className={createStyles.sectionDescription}>
                A hosted zone is a container that holds information about how
                you want to route traffic for a domain, such as example.com, and
                its subdomains.
              </p>

              <ReadOnlyField label="Domain name" value={zone.name} />
              <ReadOnlyField label="Hosted zone ID" value={zone.id} />
              <ReadOnlyField label="Record count" value={zone.recordCount} />
              <ReadOnlyField label="Type" value={typeLabel} />

              <FormField
                label={
                  <span>
                    Description - optional <InfoLink />
                  </span>
                }
                description="This value lets you distinguish hosted zones that have the same name."
                constraintText={
                  <span className={createStyles.descriptionMeta}>
                    <span>The description can have up to 256 characters.</span>
                    <span>
                      {description.length}/{DESCRIPTION_MAX}
                    </span>
                  </span>
                }
              >
                <Textarea
                  value={description}
                  onChange={({ detail }) =>
                    setDescription(detail.value.slice(0, DESCRIPTION_MAX))
                  }
                  rows={4}
                />
              </FormField>
            </SpaceBetween>
          </Container>

          <TagsSection
            tags={tags}
            onAddTag={() =>
              setTags((prev) => [...prev, { key: "", value: "" }])
            }
            onTagChange={(index, field, value) => {
              setTags((prev) =>
                prev.map((tag, i) =>
                  i === index ? { ...tag, [field]: value } : tag,
                ),
              );
            }}
            onRemoveTag={(index) => {
              setTags((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        </div>

        <div className={createStyles.actionsBar}>
          <Button variant="link" onClick={goBack}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={saving}
            onClick={handleSave}
            style={awsPrimaryButtonStyle}
          >
            Save changes
          </Button>
        </div>
      </div>
    </ConsolePage>
  );
}
