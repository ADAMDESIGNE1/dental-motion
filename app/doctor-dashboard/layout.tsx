import type {
  Metadata,
  Viewport,
} from "next";

import PwaInstallButton from "../pwa-install-button";

export const metadata: Metadata = {
  title:
    "ADAM DESIGN DOCTORS",
  description:
    "Manage your ADAM DESIGN doctor website.",
  applicationName:
    "ADAM DESIGN DOCTORS",
  manifest:
    "/doctor-app.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle:
      "black-translucent",
    title:
      "ADAM DOCTORS",
  },
  icons: {
    icon: [
      {
        url:
          "/pwa/doctor-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url:
          "/pwa/doctor-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url:
          "/pwa/doctor-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#03101a",
};

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <PwaInstallButton
        kind="doctor"
      />
    </>
  );
}
