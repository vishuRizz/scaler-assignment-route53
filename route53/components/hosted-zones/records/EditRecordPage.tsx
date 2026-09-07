"use client";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Select, { type SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
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
  composeRecordValue,
  emptyValueParts,
  parseRecordValueParts,
  subdomainFromFqdn,
  toRecordType,
  toRoutingPolicy,
  type RecordValueParts,
} from "@/lib/constants/record-form";
import { getRecord, updateRecord } from "@/lib/api/records";
import { peekHostedZone, peekRecords } from "@/lib/api/cache";
import { getHostedZone } from "@/lib/api/hosted-zones";
import type { DnsRecord, DnsRecordType } from "@/lib/types/dns-record";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { RecordValueFields } from "./RecordValueFields";
import styles from "./CreateRecordPage.module.css";

function InfoLink() {
  return (
    <Link href="#" fontSize="body-s">
      Info
    </Link>
  );
}

function optionForType(type: DnsRecordType): SelectProps.Option {
  return (
    RECORD_TYPE_OPTIONS.find((opt) => opt.value === type) ??
    RECORD_TYPE_OPTIONS[0]
  );
}

function optionForRouting(policy: string): SelectProps.Option {
  return (
    ROUTING_POLICY_OPTIONS.find((opt) => opt.value === policy) ??
    ROUTING_POLICY_OPTIONS[0]
  );
}

/**
 * Edit an existing DNS record — same field layout as create, wired to PUT.
 */
export function EditRecordPage() {
  const params = useParams<{ id: string; recordId: string }>();
  const router = useRouter();
  const zoneId = params.id;
  const recordId = params.recordId;

  const [zone, setZone] = useState<HostedZone | null | undefined>(() =>
    peekHostedZone(zoneId),
  );
  const [record, setRecord] = useState<DnsRecord | null | undefined>(() =>
    peekRecords(zoneId)?.find((r) => r.id === recordId),
  );
  const [loading, setLoading] = useState(
    () => !peekHostedZone(zoneId) || !peekRecords(zoneId)?.find((r) => r.id === recordId),
  );

  const [subdomain, setSubdomain] = useState("");
  const [type, setType] = useState<SelectProps.Option>(RECORD_TYPE_OPTIONS[0]);
  const [alias, setAlias] = useState(false);
  const [valueParts, setValueParts] = useState<RecordValueParts>(emptyValueParts());
  const [ttl, setTtl] = useState("300");
  const [routingPolicy, setRoutingPolicy] = useState<SelectProps.Option>(
    ROUTING_POLICY_OPTIONS[0],
  );
  const [valueError, setValueError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [foundZone, foundRecord] = await Promise.all([
          getHostedZone(zoneId, { fresh: Boolean(peekHostedZone(zoneId)) }),
          getRecord(recordId).catch(() => null),
        ]);
        if (cancelled) return;
        setZone(foundZone);
        setRecord(foundRecord);
      } catch {
        if (!cancelled) {
          if (!peekHostedZone(zoneId)) setZone(null);
          setRecord(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zoneId, recordId]);

  useEffect(() => {
    if (!zone || !record || hydrated) return;
    setSubdomain(subdomainFromFqdn(record.name, zone.name));
    setType(optionForType(record.type));
    setAlias(record.alias);
    setValueParts(parseRecordValueParts(record.type, record.value));
    setTtl(record.ttl == null ? "300" : String(record.ttl));
    setRoutingPolicy(optionForRouting(record.routingPolicy));
    setHydrated(true);
  }, [zone, record, hydrated]);

  const goBack = () => router.push(`/hosted-zones/${zoneId}`);
  const recordType = toRecordType(type.value);
  const typeLocked = record?.type === "NS" || record?.type === "SOA";

  const handleSave = async () => {
    if (!zone || !record) return;

    const composed = composeRecordValue(recordType, valueParts);
    if (!alias && !composed.trim()) {
      setValueError("Value is required.");
      return;
    }
    if (!alias && recordType === "MX" && !valueParts.mxPriority.trim()) {
      setValueError("Priority is required.");
      return;
    }
    if (
      !alias &&
      recordType === "SRV" &&
      (!valueParts.srvPriority.trim() ||
        !valueParts.srvWeight.trim() ||
        !valueParts.srvPort.trim())
    ) {
      setValueError("Priority, weight, and port are required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setValueError(undefined);
    try {
      await updateRecord(zone.id, record.id, {
        name: buildRecordFqdn(subdomain, zone.name),
        type: typeLocked ? record.type : recordType,
        routingPolicy: toRoutingPolicy(routingPolicy.value),
        alias,
        value: composed,
        ttl: alias ? null : Number(ttl) || 300,
      });
      router.push(`/hosted-zones/${zone.id}?recordUpdated=1`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update record.",
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
            text: "Edit record",
            href: `/hosted-zones/${zone.id}/records/${recordId}/edit`,
          },
        ]
      : [
          {
            text: "Edit record",
            href: `/hosted-zones/${zoneId}/records/${recordId}/edit`,
          },
        ]),
  ];

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
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Back to Hosted zones
          </Button>
        </Alert>
      ) : !record ? (
        <Alert type="error" header="Record not found">
          <Button variant="link" onClick={goBack}>
            Back to hosted zone
          </Button>
        </Alert>
      ) : (
        <div className={styles.page}>
          <Header variant="h1" info={<InfoLink />}>
            Edit record
          </Header>

          {submitError ? (
            <Alert type="error" header="Could not update record">
              {submitError}
            </Alert>
          ) : null}

          <Container header={<Header variant="h2">Record details</Header>}>
            <SpaceBetween size="l">
              <div className={styles.recordBlock}>
                <div className={styles.twoCol}>
                  <FormField
                    label={
                      <span>
                        Record name <InfoLink />
                      </span>
                    }
                    description="Keep blank for the root domain."
                  >
                    <div className={styles.nameRow}>
                      <div className={styles.nameInput}>
                        <Input
                          value={subdomain}
                          onChange={({ detail }) => setSubdomain(detail.value)}
                          placeholder="subdomain"
                          disabled={typeLocked}
                        />
                      </div>
                      <span className={styles.domainSuffix}>.{zone.name}</span>
                    </div>
                  </FormField>

                  <FormField
                    label={
                      <span>
                        Record type <InfoLink />
                      </span>
                    }
                    description={
                      typeLocked
                        ? "NS and SOA record types cannot be changed."
                        : undefined
                    }
                  >
                    <Select
                      selectedOption={type}
                      onChange={({ detail }) => {
                        setType(detail.selectedOption);
                        setValueParts(emptyValueParts());
                        setValueError(undefined);
                      }}
                      options={RECORD_TYPE_OPTIONS}
                      filteringType="auto"
                      disabled={typeLocked}
                    />
                  </FormField>
                </div>

                <Toggle
                  checked={alias}
                  onChange={({ detail }) => {
                    setAlias(detail.checked);
                    setValueError(undefined);
                  }}
                  disabled={typeLocked}
                >
                  Alias
                </Toggle>

                <RecordValueFields
                  type={recordType}
                  alias={alias}
                  parts={valueParts}
                  errorText={valueError}
                  onChange={(patch) => {
                    setValueParts((prev) => ({ ...prev, ...patch }));
                    setValueError(undefined);
                  }}
                />

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
                          value={ttl}
                          disabled={alias}
                          onChange={({ detail }) => setTtl(detail.value)}
                        />
                      </div>
                      <div className={styles.ttlPills}>
                        {TTL_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            className={`${styles.ttlPill}${
                              ttl === String(preset.seconds)
                                ? ` ${styles.ttlPillActive}`
                                : ""
                            }`}
                            disabled={alias}
                            onClick={() => setTtl(String(preset.seconds))}
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
                      selectedOption={routingPolicy}
                      onChange={({ detail }) =>
                        setRoutingPolicy(detail.selectedOption)
                      }
                      options={ROUTING_POLICY_OPTIONS}
                    />
                  </FormField>
                </div>
              </div>
            </SpaceBetween>
          </Container>

          <div className={styles.actionsBar}>
            <Button variant="link" onClick={goBack}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={() => void handleSave()}
              style={awsPrimaryButtonStyle}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </ConsolePage>
  );
}
