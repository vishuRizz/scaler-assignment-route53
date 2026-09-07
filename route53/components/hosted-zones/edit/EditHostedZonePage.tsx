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
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { TagsSection } from "@/components/hosted-zones/create/CreateHostedZoneFormSections";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import { peekHostedZone } from "@/lib/api/cache";
import { getHostedZone, updateHostedZone } from "@/lib/api/hosted-zones";
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

  const cached = peekHostedZone(zoneId);
  const [zone, setZone] = useState<HostedZone | null | undefined>(() => cached);
  const [loading, setLoading] = useState(() => !cached);
  const [description, setDescription] = useState(() => cached?.description ?? "");
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hit = peekHostedZone(zoneId);
    if (hit) {
      setZone(hit);
      setDescription(hit.description);
      setLoading(false);
    }
    void (async () => {
      try {
        const found = await getHostedZone(zoneId, { fresh: Boolean(hit) });
        if (cancelled) return;
        setZone(found);
        setDescription(found?.description ?? "");
      } catch {
        if (!cancelled && !peekHostedZone(zoneId)) setZone(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [zoneId]);

  const breadcrumbItems = [
    { text: "Route 53", href: "/hosted-zones" },
    { text: "Hosted zones", href: "/hosted-zones" },
    ...(zone
      ? [
          { text: zone.name, href: `/hosted-zones/${zone.id}` },
          { text: "Edit", href: `/hosted-zones/${zone.id}/edit` },
        ]
      : [{ text: "Edit", href: `/hosted-zones/${zoneId}/edit` }]),
  ];

  const goBack = () => {
    if (zone) router.push(`/hosted-zones/${zone.id}`);
    else router.push("/hosted-zones");
  };

  const handleSave = async () => {
    if (!zone) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateHostedZone(zone.id, { description });
      router.push(`/hosted-zones/${zone.id}?updated=1`);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save hosted zone.",
      );
      setSaving(false);
    }
  };

  return (
    <ConsolePage
      contentType="form"
      navigationOpenByDefault={false}
      breadcrumbItems={breadcrumbItems}
    >
      {loading && !zone ? (
        <Box color="text-body-secondary">Loading...</Box>
      ) : !zone ? (
        <Alert type="error" header="Hosted zone not found">
          This hosted zone does not exist or was deleted.{" "}
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Back to Hosted zones
          </Button>
        </Alert>
      ) : (
        <EditHostedZoneForm
          zone={zone}
          description={description}
          setDescription={setDescription}
          tags={tags}
          setTags={setTags}
          saving={saving}
          saveError={saveError}
          onSave={() => void handleSave()}
          onCancel={goBack}
        />
      )}
    </ConsolePage>
  );
}

function EditHostedZoneForm({
  zone,
  description,
  setDescription,
  tags,
  setTags,
  saving,
  saveError,
  onSave,
  onCancel,
}: {
  zone: HostedZone;
  description: string;
  setDescription: (value: string) => void;
  tags: Tag[];
  setTags: Dispatch<SetStateAction<Tag[]>>;
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const typeLabel =
    zone.type === "Public" ? "Public hosted zone" : "Private hosted zone";

  return (
    <div className={createStyles.page}>
      <Header variant="h1" info={<InfoLink />}>
        Edit {zone.name}
      </Header>

      {saveError ? (
        <Alert type="error" header="Could not save">
          {saveError}
        </Alert>
      ) : null}

      <div className={createStyles.stack}>
        <Container header={<Header variant="h2">Edit hosted zone</Header>}>
          <SpaceBetween size="l">
            <p className={createStyles.sectionDescription}>
              A hosted zone is a container that holds information about how you
              want to route traffic for a domain, such as example.com, and its
              subdomains.
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
          onAddTag={() => setTags((prev) => [...prev, { key: "", value: "" }])}
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
        <Button variant="link" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          loading={saving}
          onClick={onSave}
          style={awsPrimaryButtonStyle}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
