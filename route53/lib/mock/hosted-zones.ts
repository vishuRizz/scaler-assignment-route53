import type { HostedZone, HostedZoneType } from "@/lib/types/hosted-zone";
import {
  deleteRecordsForZone,
  getRecordCount,
  seedDefaultRecords,
} from "@/lib/mock/dns-records";

const STORAGE_KEY = "route53.mock.hosted-zones";

/**
 * Client store backed by localStorage (until FastAPI + SQLite).
 */
let hostedZones: HostedZone[] = [];
let hydrated = false;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function hydrate(): void {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      hostedZones = [];
      return;
    }
    const parsed = JSON.parse(raw) as HostedZone[];
    hostedZones = Array.isArray(parsed) ? parsed : [];
  } catch {
    hostedZones = [];
  }
}

function persist(): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hostedZones));
}

function generateZoneId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "Z";
  for (let i = 0; i < 21; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

export function listHostedZones(): HostedZone[] {
  hydrate();
  return hostedZones.map((zone) => ({
    ...zone,
    recordCount: getRecordCount(zone.id) || zone.recordCount,
  }));
}

export function getHostedZone(id: string): HostedZone | undefined {
  hydrate();
  const zone = hostedZones.find((item) => item.id === id);
  if (!zone) return undefined;
  return {
    ...zone,
    recordCount: getRecordCount(zone.id) || zone.recordCount,
  };
}

export function setHostedZones(zones: HostedZone[]): void {
  hydrate();
  hostedZones = [...zones];
  persist();
}

export type CreateHostedZoneInput = {
  name: string;
  description?: string;
  type: HostedZoneType;
};

export function createHostedZone(input: CreateHostedZoneInput): HostedZone {
  hydrate();
  const name = input.name.trim().replace(/\.$/, "");
  const zone: HostedZone = {
    id: generateZoneId(),
    name,
    type: input.type,
    createdBy: "Route 53",
    recordCount: 2,
    description: input.description?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  seedDefaultRecords(zone.id, name);
  hostedZones = [zone, ...hostedZones];
  persist();
  return zone;
}

export type UpdateHostedZoneInput = {
  description?: string;
};

export function updateHostedZone(
  id: string,
  input: UpdateHostedZoneInput,
): HostedZone | undefined {
  hydrate();
  const index = hostedZones.findIndex((zone) => zone.id === id);
  if (index < 0) return undefined;
  const current = hostedZones[index];
  const updated: HostedZone = {
    ...current,
    description:
      input.description !== undefined
        ? input.description.trim().slice(0, 256)
        : current.description,
  };
  hostedZones = [
    ...hostedZones.slice(0, index),
    updated,
    ...hostedZones.slice(index + 1),
  ];
  persist();
  return getHostedZone(id);
}

export function deleteHostedZone(id: string): boolean {
  hydrate();
  const exists = hostedZones.some((zone) => zone.id === id);
  if (!exists) return false;
  hostedZones = hostedZones.filter((zone) => zone.id !== id);
  deleteRecordsForZone(id);
  persist();
  return true;
}

export function seedDemoHostedZones(): void {
  hydrate();
  const zone: HostedZone = {
    id: "Z0123456789ABCDEFGHIJ",
    name: "example.com",
    type: "Public",
    createdBy: "Route 53",
    recordCount: 2,
    description: "Demo public zone",
    createdAt: new Date().toISOString(),
  };
  seedDefaultRecords(zone.id, zone.name);
  hostedZones = [zone];
  persist();
}
