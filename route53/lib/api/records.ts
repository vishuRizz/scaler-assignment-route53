import { apiFetch } from "@/lib/api/client";
import {
  invalidateRecords,
  isRecordsFresh,
  peekRecords,
  setRecordsCache,
} from "@/lib/api/cache";
import { mapDnsRecord, type ApiDnsRecord } from "@/lib/api/mappers";
import { getToken } from "@/lib/auth/session-storage";
import { notifyConsoleActivity } from "@/lib/notifications/store";
import type { DnsRecord } from "@/lib/types/dns-record";

function requireToken(): string {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

export type CreateDnsRecordInput = {
  name: string;
  type: string;
  routingPolicy: string;
  alias: boolean;
  value: string;
  ttl: number | null;
};

export async function listRecords(
  zoneId: string,
  options?: { fresh?: boolean },
): Promise<DnsRecord[]> {
  if (!options?.fresh) {
    const cached = peekRecords(zoneId);
    if (cached && isRecordsFresh(zoneId)) return cached;
  }

  const token = requireToken();
  const rows = await apiFetch<ApiDnsRecord[]>(
    `/hosted-zones/${zoneId}/records`,
    { token },
  );
  const records = rows.map(mapDnsRecord);
  setRecordsCache(zoneId, records);
  return records;
}

export async function createRecords(
  zoneId: string,
  inputs: CreateDnsRecordInput[],
): Promise<DnsRecord[]> {
  const token = requireToken();
  const rows = await apiFetch<ApiDnsRecord[]>(
    `/hosted-zones/${zoneId}/records`,
    {
      method: "POST",
      token,
      body: inputs.map((input) => ({
        name: input.name,
        type: input.type,
        routing_policy: input.routingPolicy,
        alias: input.alias,
        value: input.value,
        ttl: input.ttl,
      })),
    },
  );
  const created = rows.map(mapDnsRecord);
  const existing = peekRecords(zoneId) ?? [];
  setRecordsCache(zoneId, [...existing, ...created]);
  if (created.length === 1) {
    notifyConsoleActivity({
      action: "created",
      resource: "DNS record",
      name: `${created[0].name} (${created[0].type})`,
      href: `/hosted-zones/${zoneId}`,
    });
  } else if (created.length > 1) {
    notifyConsoleActivity({
      action: "created",
      resource: "DNS records",
      name: `${created.length} records`,
      detail: `${created.length} DNS records were successfully created.`,
      href: `/hosted-zones/${zoneId}`,
    });
  }
  return created;
}

export async function getRecord(recordId: string): Promise<DnsRecord> {
  const token = requireToken();
  const row = await apiFetch<ApiDnsRecord>(`/records/${recordId}`, { token });
  return mapDnsRecord(row);
}

export type UpdateDnsRecordInput = {
  name?: string;
  type?: string;
  routingPolicy?: string;
  alias?: boolean;
  value?: string;
  ttl?: number | null;
};

export async function updateRecord(
  zoneId: string,
  recordId: string,
  input: UpdateDnsRecordInput,
): Promise<DnsRecord> {
  const token = requireToken();
  const row = await apiFetch<ApiDnsRecord>(`/records/${recordId}`, {
    method: "PUT",
    token,
    body: {
      name: input.name,
      type: input.type,
      routing_policy: input.routingPolicy,
      alias: input.alias,
      value: input.value,
      ttl: input.ttl,
    },
  });
  const updated = mapDnsRecord(row);
  const existing = peekRecords(zoneId);
  if (existing) {
    setRecordsCache(
      zoneId,
      existing.map((record) => (record.id === recordId ? updated : record)),
    );
  } else {
    invalidateRecords(zoneId);
  }
  notifyConsoleActivity({
    action: "updated",
    resource: "DNS record",
    name: `${updated.name} (${updated.type})`,
    href: `/hosted-zones/${zoneId}`,
  });
  return updated;
}

export async function deleteRecords(
  zoneId: string,
  recordIds: string[],
): Promise<void> {
  const token = requireToken();
  const existing = peekRecords(zoneId);
  const doomed = existing?.filter((r) => recordIds.includes(r.id)) ?? [];
  await apiFetch<{ message: string }>("/records/delete", {
    method: "POST",
    token,
    body: recordIds,
  });
  if (existing) {
    const idSet = new Set(recordIds);
    setRecordsCache(
      zoneId,
      existing.filter((record) => !idSet.has(record.id)),
    );
  } else {
    invalidateRecords(zoneId);
  }
  if (doomed.length === 1) {
    notifyConsoleActivity({
      action: "deleted",
      resource: "DNS record",
      name: `${doomed[0].name} (${doomed[0].type})`,
      href: `/hosted-zones/${zoneId}`,
    });
  } else if (doomed.length > 1 || recordIds.length > 0) {
    const count = doomed.length || recordIds.length;
    notifyConsoleActivity({
      action: "deleted",
      resource: "DNS records",
      name: `${count} records`,
      detail: `${count} DNS records were successfully deleted.`,
      href: `/hosted-zones/${zoneId}`,
    });
  }
}
