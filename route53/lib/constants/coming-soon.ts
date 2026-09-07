import type { ComingSoonPageProps } from "@/components/coming-soon/ComingSoonPage";

/** Shared Coming Soon route metadata for Route 53 sidebar placeholders. */
export const COMING_SOON_PAGES: Record<
  string,
  Omit<ComingSoonPageProps, "breadcrumbItems"> & {
    breadcrumbs: { text: string; href: string }[];
  }
> = {
  "health-checks": {
    title: "Health checks",
    description:
      "Health checks monitor endpoints and can fail over DNS routing when resources become unhealthy.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Health checks", href: "/health-checks" },
    ],
  },
  profiles: {
    title: "Profiles",
    description:
      "Route 53 Profiles let you apply DNS settings across VPCs and accounts from a shared configuration.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Profiles", href: "/profiles" },
    ],
  },
  "global-resolvers": {
    title: "Global resolvers",
    description:
      "Global Resolver provides centralized DNS resolution across regions and hybrid environments.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Global resolvers", href: "/global-resolver/resolvers" },
    ],
  },
  "dns-views": {
    title: "Shared DNS views",
    description:
      "Shared DNS views define how resolver rules and forwarding behave across accounts and VPCs.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Shared DNS views", href: "/global-resolver/dns-views" },
    ],
  },
  vpcs: {
    title: "VPCs",
    description:
      "Associate Amazon VPCs with Route 53 Resolver so private DNS queries resolve inside your network.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "VPCs", href: "/vpc-resolver/vpcs" },
    ],
  },
  inbound: {
    title: "Inbound endpoints",
    description:
      "Inbound endpoints let DNS resolvers on your network forward queries to Route 53 Resolver.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Inbound endpoints", href: "/vpc-resolver/inbound" },
    ],
  },
  outbound: {
    title: "Outbound endpoints",
    description:
      "Outbound endpoints forward selected DNS queries from your VPC to resolvers on your network.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Outbound endpoints", href: "/vpc-resolver/outbound" },
    ],
  },
  rules: {
    title: "Rules",
    description:
      "Resolver rules control which domains are forwarded outbound and how those queries are handled.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Rules", href: "/vpc-resolver/rules" },
    ],
  },
  "query-logging": {
    title: "Query logging",
    description:
      "Query logging captures DNS queries that originate in your VPCs for monitoring and troubleshooting.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Query logging", href: "/vpc-resolver/query-logging" },
    ],
  },
  "registered-domains": {
    title: "Registered domains",
    description:
      "Registered domains lists domains you purchased or transferred through Route 53 domain registration.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Registered domains", href: "/domains/registered" },
    ],
  },
  "domain-requests": {
    title: "Requests",
    description:
      "Domain requests tracks registration, transfer, and renewal operations for Route 53 domains.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Requests", href: "/domains/requests" },
    ],
  },
  cidr: {
    title: "CIDR collections",
    description:
      "CIDR collections group IP ranges used for IP-based DNS routing decisions.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "CIDR collections", href: "/ip-based-routing/cidr" },
    ],
  },
  "traffic-policies": {
    title: "Traffic policies",
    description:
      "Traffic policies define multi-endpoint routing graphs that Route 53 evaluates for traffic flow.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Traffic policies", href: "/traffic-policies" },
    ],
  },
  "policy-records": {
    title: "Policy records",
    description:
      "Policy records attach a traffic policy version to a DNS name in a hosted zone.",
    breadcrumbs: [
      { text: "Route 53", href: "/hosted-zones" },
      { text: "Policy records", href: "/traffic-flow/policy-records" },
    ],
  },
};
