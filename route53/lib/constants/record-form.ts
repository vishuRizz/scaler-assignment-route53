import type { DnsRecordType, RoutingPolicy } from "@/lib/types/dns-record";
import type { SelectProps } from "@cloudscape-design/components/select";

export const RECORD_TYPE_OPTIONS: SelectProps.Option[] = [
  {
    label: "A – Routes traffic to an IPv4 address and some AWS resources",
    value: "A",
  },
  {
    label: "AAAA – Routes traffic to an IPv6 address and some AWS resources",
    value: "AAAA",
  },
  {
    label: "CNAME – Routes traffic to another domain name",
    value: "CNAME",
  },
  {
    label: "MX – Routes traffic to mail servers",
    value: "MX",
  },
  {
    label: "TXT – Text record",
    value: "TXT",
  },
  {
    label: "NS – Name servers for a subdomain",
    value: "NS",
  },
  {
    label: "SRV – Service locator",
    value: "SRV",
  },
  {
    label: "CAA – Certificate Authority Authorization",
    value: "CAA",
  },
  {
    label: "PTR – Reverse DNS lookup",
    value: "PTR",
  },
  {
    label: "SOA – Start of authority",
    value: "SOA",
  },
];

export const ROUTING_POLICY_OPTIONS: SelectProps.Option[] = [
  { label: "Simple routing", value: "Simple" },
  { label: "Weighted routing", value: "Weighted" },
  { label: "Latency routing", value: "Latency" },
  { label: "Failover routing", value: "Failover" },
  { label: "Geolocation routing", value: "Geolocation" },
  { label: "Multivalue answer routing", value: "Multivalue" },
];

export const TTL_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "1h", seconds: 3600 },
  { label: "1d", seconds: 86400 },
] as const;

export function valuePlaceholder(type: DnsRecordType): string {
  switch (type) {
    case "A":
      return "192.0.2.235";
    case "AAAA":
      return "2001:0db8:85a3:0:0:8a2e:0370:7334";
    case "CNAME":
      return "www.example.com";
    case "MX":
      return "10 mail.example.com";
    case "TXT":
      return '"Sample Text Entry"';
    case "NS":
      return "ns-1.example.com";
    case "SRV":
      return "10 5 5060 sipserver.example.com";
    case "CAA":
      return '0 issue "amazon.com"';
    case "PTR":
      return "hostname.example.com";
    case "SOA":
      return "ns-1.example.com hostmaster.example.com 1 7200 900 1209600 86400";
    default:
      return "";
  }
}

export function buildRecordFqdn(subdomain: string, zoneName: string): string {
  const clean = subdomain.trim().replace(/\.$/, "");
  if (!clean) return zoneName;
  if (clean === zoneName || clean.endsWith(`.${zoneName}`)) return clean;
  return `${clean}.${zoneName}`;
}

export function toRoutingPolicy(value: string | undefined): RoutingPolicy {
  switch (value) {
    case "Weighted":
    case "Latency":
    case "Failover":
    case "Geolocation":
    case "Multivalue":
      return value;
    default:
      return "Simple";
  }
}

export function toRecordType(value: string | undefined): DnsRecordType {
  const match = RECORD_TYPE_OPTIONS.find((opt) => opt.value === value);
  return (match?.value as DnsRecordType) ?? "A";
}
