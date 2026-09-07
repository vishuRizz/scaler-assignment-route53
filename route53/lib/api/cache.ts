import type { DnsRecord } from "@/lib/types/dns-record";
import type { HostedZone } from "@/lib/types/hosted-zone";

type CacheEntry<T> = {
  data: T;
  at: number;
};

const DEFAULT_TTL_MS = 60_000;

let zoneList: CacheEntry<HostedZone[]> | null = null;
const zonesById = new Map<string, CacheEntry<HostedZone>>();
const recordsByZone = new Map<string, CacheEntry<DnsRecord[]>>();

function alive<T>(entry: CacheEntry<T> | undefined | null, ttl = DEFAULT_TTL_MS): entry is CacheEntry<T> {
  return Boolean(entry && Date.now() - entry.at < ttl);
}

export function peekZoneList(): HostedZone[] | undefined {
  return zoneList?.data;
}

export function peekHostedZone(id: string): HostedZone | undefined {
  const entry = zonesById.get(id);
  return entry?.data;
}

export function peekRecords(zoneId: string): DnsRecord[] | undefined {
  return recordsByZone.get(zoneId)?.data;
}

export function setZoneListCache(zones: HostedZone[]): void {
  zoneList = { data: zones, at: Date.now() };
  for (const zone of zones) {
    zonesById.set(zone.id, { data: zone, at: Date.now() });
  }
}

export function setHostedZoneCache(zone: HostedZone): void {
  zonesById.set(zone.id, { data: zone, at: Date.now() });
  if (zoneList) {
    const next = zoneList.data.filter((item) => item.id !== zone.id);
    zoneList = { data: [zone, ...next], at: zoneList.at };
  }
}

export function setRecordsCache(zoneId: string, records: DnsRecord[]): void {
  recordsByZone.set(zoneId, { data: records, at: Date.now() });
  const zone = zonesById.get(zoneId)?.data;
  if (zone && zone.recordCount !== records.length) {
    setHostedZoneCache({ ...zone, recordCount: records.length });
  }
}

export function invalidateZoneList(): void {
  zoneList = null;
}

export function invalidateHostedZone(id: string): void {
  zonesById.delete(id);
  if (zoneList) {
    zoneList = {
      data: zoneList.data.filter((zone) => zone.id !== id),
      at: Date.now(),
    };
  }
  recordsByZone.delete(id);
}

export function invalidateRecords(zoneId: string): void {
  recordsByZone.delete(zoneId);
}

export function clearApiCache(): void {
  zoneList = null;
  zonesById.clear();
  recordsByZone.clear();
}

/** True when we have a fresh list entry (within TTL). */
export function isZoneListFresh(ttl = DEFAULT_TTL_MS): boolean {
  return alive(zoneList, ttl);
}

export function isHostedZoneFresh(id: string, ttl = DEFAULT_TTL_MS): boolean {
  return alive(zonesById.get(id), ttl);
}

export function isRecordsFresh(zoneId: string, ttl = DEFAULT_TTL_MS): boolean {
  return alive(recordsByZone.get(zoneId), ttl);
}
