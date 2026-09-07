"use client";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Select, { type SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import Textarea from "@cloudscape-design/components/textarea";
import Toggle from "@cloudscape-design/components/toggle";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConsolePage } from "@/components/console/ConsolePage";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import {
  RECORD_TYPE_OPTIONS,
  ROUTING_POLICY_OPTIONS,
  TTL_PRESETS,
  buildRecordFqdn,
  toRecordType,
  toRoutingPolicy,
  valuePlaceholder,
} from "@/lib/constants/record-form";
import { createRecords, listRecords } from "@/lib/api/records";
import { peekHostedZone, peekRecords } from "@/lib/api/cache";
import { getHostedZone } from "@/lib/api/hosted-zones";
import type { DnsRecord, DnsRecordType } from "@/lib/types/dns-record";
import type { HostedZone } from "@/lib/types/hosted-zone";
import styles from "./CreateRecordPage.module.css";

type DraftRecord = {
  id: string;
  subdomain: string;
  type: SelectProps.Option;
  alias: boolean;
  value: string;
  ttl: string;
  routingPolicy: SelectProps.Option;
  expanded: boolean;
  valueError?: string;
};

function InfoLink() {
  return (
    <Link href="#" fontSize="body-s">
      Info
    </Link>
  );
}

function newDraft(): DraftRecord {
  return {
    id: `draft-${Math.random().toString(36).slice(2, 9)}`,
    subdomain: "",
    type: RECORD_TYPE_OPTIONS[0],
    alias: false,
    value: "",
    ttl: "300",
    routingPolicy: ROUTING_POLICY_OPTIONS[0],
    expanded: true,
  };
}

/**
 * Quick create record — matches AWS Route 53 create-record form.
 */
export function CreateRecordPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const zoneId = params.id;

  const [zone, setZone] = useState<HostedZone | null | undefined>(() =>
    peekHostedZone(zoneId),
  );
  const [existing, setExisting] = useState<DnsRecord[]>(
    () => peekRecords(zoneId) ?? [],
  );
  const [loadingZone, setLoadingZone] = useState(() => !peekHostedZone(zoneId));
  const [drafts, setDrafts] = useState<DraftRecord[]>([newDraft()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = peekHostedZone(zoneId);
    if (cached) {
      setZone(cached);
      setExisting(peekRecords(zoneId) ?? []);
      setLoadingZone(false);
    }

    void (async () => {
      try {
        const [found, records] = await Promise.all([
          getHostedZone(zoneId, { fresh: Boolean(cached) }),
          listRecords(zoneId, { fresh: Boolean(peekRecords(zoneId)) }),
        ]);
        if (cancelled) return;
        setZone(found);
        setExisting(found ? records : []);
      } catch {
        if (!cancelled && !peekHostedZone(zoneId)) setZone(null);
      } finally {
        if (!cancelled) setLoadingZone(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zoneId]);

  const updateDraft = (id: string, patch: Partial<DraftRecord>) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)),
    );
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.id !== id)));
  };

  const goBack = () => router.push(`/hosted-zones/${zoneId}`);

  const handleCreate = async () => {
    if (!zone) return;

    let hasError = false;
    const next = drafts.map((draft) => {
      if (!draft.alias && !draft.value.trim()) {
        hasError = true;
        return { ...draft, valueError: "Value is required." };
      }
      return { ...draft, valueError: undefined };
    });
    setDrafts(next);
    if (hasError) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await createRecords(
        zone.id,
        next.map((draft) => ({
          name: buildRecordFqdn(draft.subdomain, zone.name),
          type: toRecordType(draft.type.value),
          routingPolicy: toRoutingPolicy(draft.routingPolicy.value),
          alias: draft.alias,
          value: draft.value,
          ttl: draft.alias ? null : Number(draft.ttl) || 300,
        })),
      );
      router.push(`/hosted-zones/${zone.id}?recordCreated=1`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create records.",
      );
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { text: "Route 53", href: "/hosted-zones" },
    { text: "Hosted zones", href: "/hosted-zones" },
    ...(zone
      ? [
          { text: zone.name, href: `/hosted-zones/${zone.id}` },
          {
            text: "Create record",
            href: `/hosted-zones/${zone.id}/records/create`,
          },
        ]
      : [
          {
            text: "Create record",
            href: `/hosted-zones/${zoneId}/records/create`,
          },
        ]),
  ];

  return (
    <ConsolePage
      contentType="form"
      navigationOpenByDefault={false}
      breadcrumbItems={breadcrumbItems}
    >
      {loadingZone && !zone ? (
        <Box color="text-body-secondary">Loading...</Box>
      ) : !zone ? (
        <Alert type="error" header="Hosted zone not found">
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Back to Hosted zones
          </Button>
        </Alert>
      ) : (
      <div className={styles.page}>
        <Header variant="h1" info={<InfoLink />}>
          Create record
        </Header>

        {submitError ? (
          <Alert type="error" header="Could not create records">
            {submitError}
          </Alert>
        ) : null}

        <div className={styles.stack}>
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Link href="#" fontSize="body-s">
                    Switch to wizard
                  </Link>
                }
              >
                Quick create record
              </Header>
            }
          >
            <SpaceBetween size="l">
              {drafts.map((draft, index) => {
                const recordType = toRecordType(draft.type.value) as DnsRecordType;
                return (
                  <ExpandableSection
                    key={draft.id}
                    variant="container"
                    expanded={draft.expanded}
                    onChange={({ detail }) =>
                      updateDraft(draft.id, { expanded: detail.expanded })
                    }
                    headerText={`Record ${index + 1}`}
                    headerActions={
                      <Button
                        disabled={drafts.length <= 1}
                        onClick={() => removeDraft(draft.id)}
                      >
                        Delete
                      </Button>
                    }
                  >
                    <div className={styles.recordBlock}>
                      <div className={styles.twoCol}>
                        <FormField
                          label={
                            <span>
                              Record name <InfoLink />
                            </span>
                          }
                          description="Keep blank to create a record for the root domain."
                        >
                          <div className={styles.nameRow}>
                            <div className={styles.nameInput}>
                              <Input
                                value={draft.subdomain}
                                onChange={({ detail }) =>
                                  updateDraft(draft.id, {
                                    subdomain: detail.value,
                                  })
                                }
                                placeholder="subdomain"
                              />
                            </div>
                            <span className={styles.domainSuffix}>
                              .{zone.name}
                            </span>
                          </div>
                        </FormField>

                        <FormField
                          label={
                            <span>
                              Record type <InfoLink />
                            </span>
                          }
                        >
                          <Select
                            selectedOption={draft.type}
                            onChange={({ detail }) =>
                              updateDraft(draft.id, {
                                type: detail.selectedOption,
                                value: "",
                                valueError: undefined,
                              })
                            }
                            options={RECORD_TYPE_OPTIONS}
                            filteringType="auto"
                          />
                        </FormField>
                      </div>

                      <Toggle
                        checked={draft.alias}
                        onChange={({ detail }) =>
                          updateDraft(draft.id, {
                            alias: detail.checked,
                            valueError: undefined,
                          })
                        }
                      >
                        Alias
                      </Toggle>

                      <FormField
                        label={
                          <span>
                            Value <InfoLink />
                          </span>
                        }
                        description={
                          draft.alias
                            ? "Choose or enter an AWS resource alias target."
                            : "Enter multiple values on separate lines."
                        }
                        errorText={draft.valueError}
                      >
                        <Textarea
                          value={draft.value}
                          onChange={({ detail }) =>
                            updateDraft(draft.id, {
                              value: detail.value,
                              valueError: undefined,
                            })
                          }
                          placeholder={
                            draft.alias
                              ? "Alias target (e.g. dualstack.example.elb.amazonaws.com)"
                              : valuePlaceholder(recordType)
                          }
                          rows={4}
                        />
                      </FormField>

                      <div className={styles.twoCol}>
                        <FormField
                          label={
                            <span>
                              TTL (seconds) <InfoLink />
                            </span>
                          }
                          description="Recommended values: 60 to 172800 (two days)"
                        >
                          <div className={styles.ttlRow}>
                            <div className={styles.ttlInput}>
                              <Input
                                type="number"
                                value={draft.ttl}
                                disabled={draft.alias}
                                onChange={({ detail }) =>
                                  updateDraft(draft.id, { ttl: detail.value })
                                }
                              />
                            </div>
                            <div className={styles.ttlPills}>
                              {TTL_PRESETS.map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  className={`${styles.ttlPill}${
                                    draft.ttl === String(preset.seconds)
                                      ? ` ${styles.ttlPillActive}`
                                      : ""
                                  }`}
                                  disabled={draft.alias}
                                  onClick={() =>
                                    updateDraft(draft.id, {
                                      ttl: String(preset.seconds),
                                    })
                                  }
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </FormField>

                        <FormField
                          label={
                            <span>
                              Routing policy <InfoLink />
                            </span>
                          }
                        >
                          <Select
                            selectedOption={draft.routingPolicy}
                            onChange={({ detail }) =>
                              updateDraft(draft.id, {
                                routingPolicy: detail.selectedOption,
                              })
                            }
                            options={ROUTING_POLICY_OPTIONS}
                          />
                        </FormField>
                      </div>
                    </div>
                  </ExpandableSection>
                );
              })}

              <div className={styles.addAnotherRow}>
                <Button onClick={() => setDrafts((prev) => [...prev, newDraft()])}>
                  Add another record
                </Button>
              </div>
            </SpaceBetween>
          </Container>

          <ExpandableSection headerText="View existing records" defaultExpanded={false}>
            <div className={styles.existingTable}>
              <Table
                variant="embedded"
                columnDefinitions={[
                  {
                    id: "name",
                    header: "Record name",
                    cell: (item) => (
                      <span className={styles.existingName}>{item.name}</span>
                    ),
                  },
                  { id: "type", header: "Type", cell: (item) => item.type },
                  {
                    id: "value",
                    header: "Value",
                    cell: (item) => (
                      <div className={styles.existingValue}>{item.value}</div>
                    ),
                  },
                  {
                    id: "ttl",
                    header: "TTL",
                    cell: (item) =>
                      item.ttl == null ? "-" : item.ttl.toLocaleString("en-US"),
                  },
                ]}
                items={existing}
                trackBy="id"
                empty={
                  <Box textAlign="center" color="inherit" padding="m">
                    No records
                  </Box>
                }
              />
            </div>
          </ExpandableSection>
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
            Create records
          </Button>
        </div>
      </div>
      )}
    </ConsolePage>
  );
}
