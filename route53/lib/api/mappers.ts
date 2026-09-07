import type { DnsRecord, DnsRecordType, RoutingPolicy } from "@/lib/types/dns-record";
import type { HostedZone, HostedZoneType } from "@/lib/types/hosted-zone";

export type ApiHostedZone = {
  id: string;
  name: string;
  type: string;
  description: string;
  comment: string;
  created_by: string;
  record_count: number;
  created_at: string;
};

export type ApiDnsRecord = {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: string;
  routing_policy: string;
  differentiator: string;
  alias: boolean;
  value: string;
  ttl: number | null;
  health_check_id: string;
  evaluate_target_health: string;
  created_at: string;
  updated_at: string;
};

/** Backend stores FQDN with trailing dot; UI historically showed without it. */
export function displayZoneName(name: string): string {
  return name.replace(/\.$/, "");
}

export function mapHostedZone(row: ApiHostedZone): HostedZone {
  return {
    id: row.id,
    name: displayZoneName(row.name),
    type: (row.type === "Private" ? "Private" : "Public") as HostedZoneType,
    createdBy: row.created_by,
    recordCount: row.record_count,
    description: row.description,
    comment: row.comment,
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date(row.created_at).toISOString(),
  };
}

export function mapDnsRecord(row: ApiDnsRecord): DnsRecord {
  return {
    id: row.id,
    hostedZoneId: row.hosted_zone_id,
    name: displayZoneName(row.name),
    type: row.type as DnsRecordType,
    routingPolicy: (row.routing_policy || "Simple") as RoutingPolicy,
    differentiator: row.differentiator,
    alias: row.alias,
    value: row.value,
    ttl: row.ttl,
    healthCheckId: row.health_check_id,
    evaluateTargetHealth: row.evaluate_target_health,
  };
}
