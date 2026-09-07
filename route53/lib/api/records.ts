import { apiFetch } from "@/lib/api/client";
import {
  invalidateRecords,
  isRecordsFresh,
  peekRecords,
  setRecordsCache,
} from "@/lib/api/cache";
import { mapDnsRecord, type ApiDnsRecord } from "@/lib/api/mappers";
import { getToken } from "@/lib/auth/session-storage";
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
  return created;
}

export async function deleteRecords(
  zoneId: string,
  recordIds: string[],
): Promise<void> {
  const token = requireToken();
  await apiFetch<{ message: string }>("/records/delete", {
    method: "POST",
    token,
    body: recordIds,
  });
  const existing = peekRecords(zoneId);
  if (existing) {
    const idSet = new Set(recordIds);
    setRecordsCache(
      zoneId,
      existing.filter((record) => !idSet.has(record.id)),
    );
  } else {
    invalidateRecords(zoneId);
  }
}
