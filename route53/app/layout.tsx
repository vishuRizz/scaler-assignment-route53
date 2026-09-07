import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hosted zones | Route 53 | AWS Console",
  description: "AWS Route 53 hosted zones console clone",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
