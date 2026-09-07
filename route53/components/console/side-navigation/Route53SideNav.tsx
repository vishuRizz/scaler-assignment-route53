"use client";

import SideNavigation from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants/console";
import { route53NavItems } from "@/lib/constants/navigation";

type Route53SideNavProps = {
  onFollow?: () => void;
};

/**
 * Route 53 left navigation — structure mirrors the AWS console sidebar.
 */
export function Route53SideNav({ onFollow }: Route53SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SideNavigation
      header={{ href: "/hosted-zones", text: APP_NAME }}
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
