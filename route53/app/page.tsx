import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Amazon Route 53 - DNS Service - AWS",
  description:
    "A reliable and cost-effective way to route end users to Internet applications",
};

export default function HomePage() {
  return <LandingPage />;
}
