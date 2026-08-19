"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const VISITOR_KEY =
  "adam-site-visitor-id";

const SESSION_KEY =
  "adam-site-session-id";

function createId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getBrowserName() {
  const ua =
    navigator.userAgent;

  if (/edg/i.test(ua)) {
    return "Edge";
  }

  if (/opr|opera/i.test(ua)) {
    return "Opera";
  }

  if (/firefox|fxios/i.test(ua)) {
    return "Firefox";
  }

  if (/chrome|crios/i.test(ua)) {
    return "Chrome";
  }

  if (/safari/i.test(ua)) {
    return "Safari";
  }

  return "Other";
}

function getOsName() {
  const ua =
    navigator.userAgent;

  if (/android/i.test(ua)) {
    return "Android";
  }

  if (
    /iphone|ipad|ipod/i.test(ua)
  ) {
    return "iOS";
  }

  if (/windows/i.test(ua)) {
    return "Windows";
  }

  if (/mac os|macintosh/i.test(ua)) {
    return "macOS";
  }

  if (/linux/i.test(ua)) {
    return "Linux";
  }

  return "Other";
}

function getDeviceType() {
  const ua =
    navigator.userAgent;

  if (
    /ipad|tablet/i.test(ua)
  ) {
    return "Tablet";
  }

  if (
    /android|iphone|ipod|mobile/i.test(
      ua
    )
  ) {
    return "Mobile";
  }

  return "Desktop";
}

function getReferrerHost() {
  if (!document.referrer) {
    return "Direct";
  }

  try {
    const url =
      new URL(
        document.referrer
      );

    if (
      url.hostname ===
      window.location.hostname
    ) {
      return "Internal";
    }

    return (
      url.hostname
        .replace(
          /^www\./,
          ""
        ) || "Direct"
    );
  } catch {
    return "Unknown";
  }
}

function shouldSkipPath(
  pathname: string
) {
  return (
    pathname.startsWith(
      "/admin"
    ) ||
    pathname.startsWith(
      "/doctor-dashboard"
    ) ||
    pathname.startsWith(
      "/doctor-login"
    ) ||
    pathname.startsWith(
      "/register"
    )
  );
}

export default function SiteAnalyticsTracker() {
  const pathname =
    usePathname();

  useEffect(() => {
    if (
      !pathname ||
      shouldSkipPath(pathname)
    ) {
      return;
    }

    let cancelled = false;

    async function trackVisit() {
      try {
        /*
         * لا نحسب حسابات الأدمن/الأطباء المسجلين.
         * الهدف هو قياس الزوار العامين فقط.
         */
        const {
          data: sessionData,
        } =
          await supabase.auth.getSession();

        if (
          cancelled ||
          sessionData.session?.user
        ) {
          return;
        }

        const existingVisitor =
          localStorage.getItem(
            VISITOR_KEY
          );

        const visitorId =
          existingVisitor ||
          createId();

        if (!existingVisitor) {
          localStorage.setItem(
            VISITOR_KEY,
            visitorId
          );
        }

        let sessionId =
          sessionStorage.getItem(
            SESSION_KEY
          );

        if (!sessionId) {
          sessionId =
            createId();

          sessionStorage.setItem(
            SESSION_KEY,
            sessionId
          );
        }

        /*
         * يمنع تسجيل نفس الصفحة بشكل متكرر
         * بسبب Refresh سريع أو React dev mode.
         */
        const dedupeKey =
          `adam-analytics:${pathname}`;

        const lastTracked =
          Number(
            sessionStorage.getItem(
              dedupeKey
            ) || "0"
          );

        if (
          lastTracked > 0 &&
          Date.now() -
            lastTracked <
            30_000
        ) {
          return;
        }

        sessionStorage.setItem(
          dedupeKey,
          Date.now().toString()
        );

        let timezone =
          "Unknown";

        try {
          timezone =
            Intl.DateTimeFormat()
              .resolvedOptions()
              .timeZone ||
            "Unknown";
        } catch {
          // لا شيء
        }

        await supabase.rpc(
          "record_site_visit",
          {
            p_visitor_id:
              visitorId,
            p_session_id:
              sessionId,
            p_path:
              pathname,
            p_referrer_host:
              getReferrerHost(),
            p_device_type:
              getDeviceType(),
            p_browser_name:
              getBrowserName(),
            p_os_name:
              getOsName(),
            p_language:
              navigator.language ||
              "Unknown",
            p_timezone:
              timezone,
            p_screen_size:
              `${window.screen.width}x${window.screen.height}`,
            p_is_returning:
              Boolean(
                existingVisitor
              ),
          }
        );
      } catch (error) {
        /*
         * التحليلات ما لازم تعطل الموقع
         * حتى لو صار خطأ بالاتصال.
         */
        console.debug(
          "SITE ANALYTICS:",
          error
        );
      }
    }

    void trackVisit();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}