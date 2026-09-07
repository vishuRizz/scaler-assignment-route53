"use client";

import SideNavigation from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";
import { route53NavItems } from "@/lib/constants/navigation";

type Route53SideNavProps = {
  onFollow?: () => void;
};

/**
 * Route 53 left nav links.
 * Service title ("Route 53") lives in ConsoleShell sidebar header,
 * so this component only renders the item list.
 */
export function Route53SideNav({ onFollow }: Route53SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SideNavigation
      activeHref={pathname}
      items={route53NavItems}
      onFollow={(event) => {
        if (
          event.detail.external ||
          event.detail.href.startsWith("http") ||
          event.detail.href.startsWith("#")
        ) {
          return;
        }
        event.preventDefault();
        onFollow?.();
        router.push(event.detail.href);
      }}
    />
  );
}
