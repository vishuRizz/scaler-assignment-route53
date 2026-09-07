import type { Metadata } from "next";
import Script from "next/script";
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

const THEME_BOOTSTRAP = `(function(){try{var m=localStorage.getItem("route53.visualMode")||"light";var dark=m==="dark"||(m==="browser"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var el=document.documentElement;el.dataset.visualMode=dark?"dark":"light";el.style.colorScheme=dark?"dark":"light";el.style.background=dark?"#131920":"#ffffff";if(document.body){document.body.classList.toggle("awsui-dark-mode",dark);document.body.style.background=dark?"#131920":"";}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={{ minHeight: "100%" }} suppressHydrationWarning>
      <body style={{ minHeight: "100%", overflowY: "auto" }} suppressHydrationWarning>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {THEME_BOOTSTRAP}
        </Script>
        <ThemeProvider>
          <CloudscapeTheme>
            <AuthProvider>{children}</AuthProvider>
          </CloudscapeTheme>
        </ThemeProvider>
      </body>
    </html>
  );
}
