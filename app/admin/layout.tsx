import type {
  Metadata,
  Viewport,
} from "next";

import PwaInstallButton from "../pwa-install-button";

export const metadata: Metadata = {
  title:
    "ADAM DESIGN ADMIN",
  description:
    "Admin control center for ADAM DESIGN.",
  applicationName:
    "ADAM DESIGN ADMIN",
  manifest:
    "/admin-app.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle:
      "black-translucent",
    title:
      "ADAM ADMIN",
  },
  icons: {
    icon: [
      {
        url:
          "/pwa/admin-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url:
          "/pwa/admin-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url:
          "/pwa/admin-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <PwaInstallButton
        kind="admin"
      />
    </>
  );
}
