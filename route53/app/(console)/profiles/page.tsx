"use client";

import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";
import { COMING_SOON_PAGES } from "@/lib/constants/coming-soon";

const page = COMING_SOON_PAGES["profiles"];

export default function Page() {
  return (
    <ComingSoonPage
      title={page.title}
      description={page.description}
      breadcrumbItems={page.breadcrumbs}
    />
  );
}
