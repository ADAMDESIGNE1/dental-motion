"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const VISITOR_KEY =
  "adam-site-visitor-id";

const SESSION_KEY =
  "adam-site-session-id";

/*
 * إذا هذا المتصفح استُخدم بحساب أدمن أو طبيب،
 * نعتبره جهاز داخلي وما نحسب زياراته العامة بعدين.
 */
const INTERNAL_DEVICE_KEY =
  "adam-site-internal-device";

const HUMAN_DELAY_MS = 2500;

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

function isPrivatePath(
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

function isLocalOrPreview() {
  const host =
    window.location.hostname
      .toLowerCase();

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith(
      "deploy-preview-"
    ) ||
    host.startsWith(
      "branch-"
    )
  );
}

function looksLikeBot() {
  const ua =
    navigator.userAgent
      .toLowerCase();

  const botPattern =
    /bot|crawler|spider|crawling|headless|lighthouse|pagespeed|googlebot|bingbot|duckduckbot|baiduspider|yandexbot|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|semrush|ahrefs|uptimerobot|monitoring|synthetic|phantomjs|selenium|puppeteer|playwright/i;

  const webdriver =
    Boolean(
      (
        navigator as Navigator & {
          webdriver?: boolean;
        }
      ).webdriver
    );

  return (
    webdriver ||
    botPattern.test(ua)
  );
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

function waitForVisibleHumanPage() {
  return new Promise<void>(
    (resolve) => {
      let timer:
        | ReturnType<
            typeof setTimeout
          >
        | null = null;

      function finish() {
        if (timer) {
          clearTimeout(
            timer
          );
        }

        document.removeEventListener(
          "visibilitychange",
          schedule
        );

        resolve();
      }

      function schedule() {
        if (
          document.visibilityState !==
          "visible"
        ) {
          if (timer) {
            clearTimeout(
              timer
            );
            timer = null;
          }

          return;
        }

        if (timer) {
          return;
        }

        timer =
          setTimeout(
            finish,
            HUMAN_DELAY_MS
          );
      }

      schedule();

      document.addEventListener(
        "visibilitychange",
        schedule
      );
    }
  );
}

export default function SiteAnalyticsTracker() {
  const pathname =
    usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    let cancelled =
      false;

    async function trackVisit() {
      try {
        /*
         * ما نحسب localhost أو Netlify preview.
         */
        if (
          isLocalOrPreview()
        ) {
          return;
        }

        /*
         * نرفض أغلب crawlers / headless / automation.
         */
        if (
          looksLikeBot()
        ) {
          return;
        }

        /*
         * حتى بالمسارات الخاصة نفحص الجلسة:
         * إذا الجهاز استُخدم من أدمن/طبيب نخزنه
         * كجهاز داخلي وما نحسب زياراته العامة.
         */
        const {
          data: sessionData,
        } =
          await supabase.auth.getSession();

        if (cancelled) {
          return;
        }

        if (
          sessionData.session?.user
        ) {
          localStorage.setItem(
            INTERNAL_DEVICE_KEY,
            "1"
          );

          return;
        }

        /*
         * صفحات الإدارة والطبيب والتسجيل
         * لا تدخل بالإحصائيات العامة.
         */
        if (
          isPrivatePath(
            pathname
          )
        ) {
          return;
        }

        /*
         * إذا هذا الجهاز معروف كجهاز داخلي
         * لا نحسبه حتى لو الأدمن/الطبيب طلع من الحساب.
         */
        if (
          localStorage.getItem(
            INTERNAL_DEVICE_KEY
          ) === "1"
        ) {
          return;
        }

        /*
         * ما نسجل فتحات سريعة أو تحميلات آلية:
         * لازم الصفحة تبقى ظاهرة 2.5 ثانية.
         */
        await waitForVisibleHumanPage();

        if (
          cancelled ||
          document.visibilityState !==
            "visible"
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
         * يمنع تكرار نفس الصفحة بسبب
         * Refresh سريع أو React dev mode.
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
            60_000
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
          // ignore
        }

        const {
          error: analyticsError,
        } =
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

        if (analyticsError) {
          console.debug(
            "SITE ANALYTICS RPC:",
            analyticsError.message
          );
        }
      } catch (error) {
        /*
         * التحليلات ما لازم تعطل الموقع.
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