"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import { createHostedZone } from "@/lib/api/hosted-zones";
import type { HostedZoneType } from "@/lib/types/hosted-zone";
import {
  HostedZoneConfigSection,
  TagsSection,
} from "./CreateHostedZoneFormSections";
import styles from "./CreateHostedZonePage.module.css";

type Tag = { key: string; value: string };

/**
 * Create hosted zone page — matches AWS Route 53 create form layout.
 */
export function CreateHostedZonePage() {
  const router = useRouter();
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<HostedZoneType>("Public");
  const [tags, setTags] = useState<Tag[]>([]);
  const [domainError, setDomainError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const goBack = () => router.push("/hosted-zones");

  const handleCreate = async () => {
    const trimmed = domainName.trim();
    if (!trimmed) {
      setDomainError("Domain name is required.");
      return;
    }
    setDomainError(undefined);
    setSubmitting(true);
    try {
      const zone = await createHostedZone({
        name: trimmed,
        description,
        type: zoneType,
      });
      router.push(`/hosted-zones/${zone.id}?created=1`);
    } catch (err) {
      setDomainError(
        err instanceof Error ? err.message : "Failed to create hosted zone.",
      );
      setSubmitting(false);
    }
  };

  return (
    <ConsolePage
      contentType="form"
      navigationOpenByDefault={false}
      breadcrumbItems={[
        { text: "Route 53", href: "/hosted-zones" },
        { text: "Hosted zones", href: "/hosted-zones" },
        { text: "Create hosted zone", href: "/hosted-zones/create" },
      ]}
    >
      <div className={styles.page}>
        <Header
          variant="h1"
          info={
            <Link href="#" fontSize="body-s">
              Info
            </Link>
          }
        >
          Create hosted zone
        </Header>

        <div className={styles.stack}>
          <HostedZoneConfigSection
            domainName={domainName}
            description={description}
            zoneType={zoneType}
            domainError={domainError}
            onDomainChange={(value) => {
              setDomainName(value);
              if (domainError) setDomainError(undefined);
            }}
            onDescriptionChange={setDescription}
            onTypeChange={setZoneType}
          />

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

        <div className={styles.actionsBar}>
          <Button variant="link" onClick={goBack}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={() => void handleCreate()}
            style={awsPrimaryButtonStyle}
          >
            Create hosted zone
          </Button>
        </div>
      </div>
    </ConsolePage>
  );
}
