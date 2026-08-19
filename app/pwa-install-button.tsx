"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type InstallKind =
  | "admin"
  | "doctor";

type BeforeInstallPromptEvent =
  Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome:
        | "accepted"
        | "dismissed";
      platform: string;
    }>;
  };

type Props = {
  kind: InstallKind;
};

function isStandaloneMode() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  const displayMode =
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

  const iosStandalone =
    Boolean(
      (
        navigator as Navigator & {
          standalone?: boolean;
        }
      ).standalone
    );

  return (
    displayMode ||
    iosStandalone
  );
}

function isIosDevice() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return false;
  }

  return /iphone|ipad|ipod/i.test(
    navigator.userAgent
  );
}

export default function PwaInstallButton({
  kind,
}: Props) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(
      null
    );

  const [installed, setInstalled] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  const config = useMemo(
    () =>
      kind === "admin"
        ? {
            title:
              "ADAM DESIGN ADMIN",
            button:
              "ثبت تطبيق الأدمن",
            accent:
              "#ffbf69",
            darkText:
              "#1b1104",
          }
        : {
            title:
              "ADAM DESIGN DOCTORS",
            button:
              "ثبت تطبيق الطبيب",
            accent:
              "#32baff",
            darkText:
              "#02111a",
          },
    [kind]
  );

  useEffect(() => {
    setInstalled(
      isStandaloneMode()
    );

    if (
      "serviceWorker" in
      navigator
    ) {
      navigator.serviceWorker
        .register(
          "/sw.js",
          {
            scope: "/",
          }
        )
        .catch((error) => {
          console.error(
            "PWA SERVICE WORKER:",
            error
          );
        });
    }

    function onBeforeInstall(
      event: Event
    ) {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    }

    function onInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      setHelpOpen(false);
    }

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstall
    );

    window.addEventListener(
      "appinstalled",
      onInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstall
      );

      window.removeEventListener(
        "appinstalled",
        onInstalled
      );
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();

      const result =
        await installPrompt.userChoice;

      if (
        result.outcome ===
        "accepted"
      ) {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setHelpOpen(true);
  }

  if (installed) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        aria-label={config.button}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding:
            "11px 14px",
          border:
            `1px solid ${config.accent}55`,
          borderRadius: 999,
          color:
            config.accent,
          background:
            "rgba(2,8,16,.92)",
          boxShadow:
            "0 14px 38px rgba(0,0,0,.34)",
          backdropFilter:
            "blur(14px)",
          WebkitBackdropFilter:
            "blur(14px)",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            display: "grid",
            placeItems:
              "center",
            borderRadius: 7,
            color:
              config.darkText,
            background:
              config.accent,
            fontSize: 12,
          }}
        >
          ↓
        </span>

        {config.button}
      </button>

      {helpOpen && (
        <div
          dir="rtl"
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "grid",
            placeItems:
              "center",
            padding: 20,
            background:
              "rgba(0,0,0,.72)",
            backdropFilter:
              "blur(8px)",
            WebkitBackdropFilter:
              "blur(8px)",
          }}
          onClick={() =>
            setHelpOpen(false)
          }
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                "min(420px,100%)",
              padding: 22,
              borderRadius: 18,
              color: "#fff",
              border:
                `1px solid ${config.accent}33`,
              background:
                "#06101d",
              boxShadow:
                "0 26px 80px rgba(0,0,0,.5)",
            }}
          >
            <small
              style={{
                color:
                  config.accent,
                fontWeight: 900,
                letterSpacing:
                  ".08em",
              }}
            >
              {config.title}
            </small>

            <h3
              style={{
                margin:
                  "9px 0 10px",
                fontSize: 21,
              }}
            >
              تثبيت التطبيق
            </h3>

            <p
              style={{
                margin: 0,
                color:
                  "rgba(255,255,255,.64)",
                fontSize: 13,
                lineHeight: 2,
              }}
            >
              {isIosDevice()
                ? "على iPhone/iPad: افتح الصفحة في Safari، اضغط زر المشاركة، وبعدها اختر «إضافة إلى الشاشة الرئيسية»."
                : "إذا ما ظهر زر التثبيت مباشرة، افتح قائمة المتصفح ⋮ واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."}
            </p>

            <button
              type="button"
              onClick={() =>
                setHelpOpen(false)
              }
              style={{
                width: "100%",
                marginTop: 16,
                padding:
                  "11px 14px",
                borderRadius: 10,
                color:
                  config.darkText,
                background:
                  config.accent,
                border: 0,
                fontWeight: 900,
                cursor:
                  "pointer",
              }}
            >
              تمام
            </button>
          </div>
        </div>
      )}
    </>
  );
}
