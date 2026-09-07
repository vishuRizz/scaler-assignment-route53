import type { HostedZone } from "@/lib/types/hosted-zone";

/**
 * In-memory store for UI development.
 * Empty by default so the list page matches the empty-state screenshot.
 * Swap this module for a real API client later.
 */
let hostedZones: HostedZone[] = [];

export function listHostedZones(): HostedZone[] {
  return [...hostedZones];
}

export function getHostedZone(id: string): HostedZone | undefined {
  return hostedZones.find((zone) => zone.id === id);
}

export function setHostedZones(zones: HostedZone[]): void {
  hostedZones = [...zones];
}

export function seedDemoHostedZones(): void {
  hostedZones = [
    {
      id: "Z0123456789ABCDEFGHIJ",
      name: "example.com",
      type: "Public",
      createdBy: "Route 53",
      recordCount: 4,
      description: "Demo public zone",
      createdAt: new Date().toISOString(),
    },
  ];
}
