export const CONSOLE_ACCOUNT = {
  displayName: "vishurizz0",
  accountId: "571600859548",
  /** Displayed with hyphens in the account menu */
  accountIdFormatted: "5716-0085-9548",
  freePlan: {
    creditsRemaining: "$100.00 USD",
    daysRemaining: "182 days",
    endsOn: "Mar 07, 2027",
  },
  accountColour: "Unset",
} as const;

export const APP_NAME = "Route 53" as const;

export const ACCOUNT_MENU_LINKS = [
  { label: "Account", href: "#" },
  { label: "Organisation", href: "#" },
  { label: "Service Quotas", href: "#" },
  { label: "Billing and Cost Management", href: "#" },
  { label: "Security credentials", href: "#" },
  { label: "Console mobile app", href: "#", muted: true },
  { label: "Agent Toolkit for AWS", href: "#" },
] as const;
