"use client";

import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { ConsoleBreadcrumbs } from "@/components/console/ConsoleBreadcrumbs";
import {
  useConsoleChromeContext,
  type ConsoleContentType,
} from "@/lib/console/ConsoleChromeContext";

type BreadcrumbItem = { text: string; href: string };

type ConsolePageProps = {
  breadcrumbItems: BreadcrumbItem[];
  contentType?: ConsoleContentType;
  navigationOpenByDefault?: boolean;
  children: ReactNode;
};

/**
 * Registers breadcrumbs / content chrome for the persistent console layout.
 * Only the children remount on route change — TopNav/sidebar stay put.
 */
export function ConsolePage({
  breadcrumbItems,
  contentType = "default",
  navigationOpenByDefault = true,
  children,
}: ConsolePageProps) {
  const { setChrome } = useConsoleChromeContext();

  const breadcrumbKey = breadcrumbItems
    .map((item) => `${item.text}:${item.href}`)
    .join("|");

  const breadcrumbs = useMemo(
    () => <ConsoleBreadcrumbs items={breadcrumbItems} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [breadcrumbKey],
  );

  // Before paint so form pages don't flash an open sidebar from the previous route.
  useLayoutEffect(() => {
    setChrome({ breadcrumbs, contentType, navigationOpenByDefault });
  }, [breadcrumbs, contentType, navigationOpenByDefault, setChrome]);

  return children;
}
