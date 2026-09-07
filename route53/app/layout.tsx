import type { Metadata } from "next";
import { CloudscapeTheme } from "@/components/console/CloudscapeTheme";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon Route 53 - DNS Service - AWS",
  description:
    "A reliable and cost-effective way to route end users to Internet applications",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/route53-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={{ minHeight: "100%" }} suppressHydrationWarning>
      <body style={{ minHeight: "100%", overflowY: "auto" }}>
        <ThemeProvider>
          <CloudscapeTheme>
            <AuthProvider>{children}</AuthProvider>
          </CloudscapeTheme>
        </ThemeProvider>
      </body>
    </html>
  );
}
