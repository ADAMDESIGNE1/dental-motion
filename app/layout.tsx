import type { Metadata } from "next";
import "./globals.css";
import SiteAnalyticsTracker from "./site-analytics-tracker";

export const metadata: Metadata = {
  title: "DENTAL MOTION / Portfolio",
  description: "Cinematic dental editor portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteAnalyticsTracker />
        {children}
      </body>
    </html>
  );
}