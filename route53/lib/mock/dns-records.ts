import type { DnsRecord } from "@/lib/types/dns-record";

const STORAGE_KEY = "route53.mock.dns-records";

/** In-memory cache, backed by localStorage. */
let recordsByZone = new Map<string, DnsRecord[]>();
let hydrated = false;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function hydrate(): void {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, DnsRecord[]>;
    recordsByZone = new Map(
      Object.entries(parsed).map(([id, records]) => [id, records]),
    );
  } catch {
    recordsByZone = new Map();
  }
}

function persist(): void {
  if (!canUseStorage()) return;
  const obj: Record<string, DnsRecord[]> = {};
  for (const [id, records] of recordsByZone.entries()) {
    obj[id] = records;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function generateRecordId(): string {
  return `R${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
}

function pickNameServers(): string[] {
  const pools = [
    ["ns-149.awsdns-18.com.", "ns-1882.awsdns-43.co.uk.", "ns-1017.awsdns-63.net.", "ns-1276.awsdns-31.org."],
    ["ns-204.awsdns-25.com.", "ns-956.awsdns-55.net.", "ns-1422.awsdns-49.org.", "ns-1701.awsdns-20.co.uk."],
    ["ns-312.awsdns-39.com.", "ns-845.awsdns-41.net.", "ns-1102.awsdns-09.org.", "ns-1998.awsdns-57.co.uk."],
  ];
  return pools[Math.floor(Math.random() * pools.length)];
}

/**
 * Seeds the default NS + SOA records AWS creates with every hosted zone.
 */
export function seedDefaultRecords(hostedZoneId: string, zoneName: string): DnsRecord[] {
  hydrate();
  const nameServers = pickNameServers();
  const nsValue = nameServers.join("\n");
  const primaryNs = nameServers[0];
  const soaValue = `${primaryNs} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400`;

  const records: DnsRecord[] = [
    {
      id: generateRecordId(),
      hostedZoneId,
      name: zoneName,
      type: "NS",
      routingPolicy: "Simple",
      differentiator: "-",
      alias: false,
      value: nsValue,
      ttl: 172800,
      healthCheckId: "-",
      evaluateTargetHealth: "-",
    },
    {
      id: generateRecordId(),
      hostedZoneId,
      name: zoneName,
      type: "SOA",
      routingPolicy: "Simple",
      differentiator: "-",
      alias: false,
      value: soaValue,
      ttl: 900,
      healthCheckId: "-",
      evaluateTargetHealth: "-",
    },
  ];

  recordsByZone.set(hostedZoneId, records);
  persist();
  return records;
}

export function listRecords(hostedZoneId: string): DnsRecord[] {
  hydrate();
  return [...(recordsByZone.get(hostedZoneId) ?? [])];
}

export function getRecordCount(hostedZoneId: string): number {
  hydrate();
  return recordsByZone.get(hostedZoneId)?.length ?? 0;
}

export function deleteRecordsForZone(hostedZoneId: string): void {
  hydrate();
  recordsByZone.delete(hostedZoneId);
  persist();
}

export type CreateDnsRecordInput = {
  hostedZoneId: string;
  name: string;
  type: DnsRecord["type"];
  routingPolicy: DnsRecord["routingPolicy"];
  alias: boolean;
  value: string;
  ttl: number | null;
};

export function createRecords(inputs: CreateDnsRecordInput[]): DnsRecord[] {
  hydrate();
  const created: DnsRecord[] = [];
  for (const input of inputs) {
    const existing = recordsByZone.get(input.hostedZoneId) ?? [];
    const record: DnsRecord = {
      id: generateRecordId(),
      hostedZoneId: input.hostedZoneId,
      name: input.name,
      type: input.type,
      routingPolicy: input.routingPolicy,
      differentiator: "-",
      alias: input.alias,
      value: input.value.trim(),
      ttl: input.alias ? null : input.ttl,
      healthCheckId: "-",
      evaluateTargetHealth: "-",
    };
    recordsByZone.set(input.hostedZoneId, [...existing, record]);
    created.push(record);
  }
  persist();
  return created;
}

export function deleteRecords(
  hostedZoneId: string,
  recordIds: string[],
): number {
  hydrate();
  const existing = recordsByZone.get(hostedZoneId) ?? [];
  const idSet = new Set(recordIds);
  const next = existing.filter((record) => !idSet.has(record.id));
  const removed = existing.length - next.length;
  recordsByZone.set(hostedZoneId, next);
  persist();
  return removed;
}

export function getRecord(
  hostedZoneId: string,
  recordId: string,
): DnsRecord | undefined {
  hydrate();
  return (recordsByZone.get(hostedZoneId) ?? []).find((r) => r.id === recordId);
}

export function updateRecord(
  hostedZoneId: string,
  recordId: string,
  patch: Partial<
    Pick<
      DnsRecord,
      "name" | "type" | "routingPolicy" | "alias" | "value" | "ttl"
    >
  >,
): DnsRecord | undefined {
  hydrate();
  const existing = recordsByZone.get(hostedZoneId) ?? [];
  const index = existing.findIndex((r) => r.id === recordId);
  if (index < 0) return undefined;
  const updated: DnsRecord = { ...existing[index], ...patch };
  const next = [...existing];
  next[index] = updated;
  recordsByZone.set(hostedZoneId, next);
  persist();
  return updated;
}
