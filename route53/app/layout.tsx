import type { Metadata } from "next";
import { CloudscapeTheme } from "@/components/console/CloudscapeTheme";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon Route 53 - DNS Service - AWS",
  description:
    "A reliable and cost-effective way to route end users to Internet applications",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={{ minHeight: "100%" }}>
      <body style={{ minHeight: "100%", overflowY: "auto" }}>
        <CloudscapeTheme>
          <AuthProvider>{children}</AuthProvider>
        </CloudscapeTheme>
      </body>
    </html>
  );
}
