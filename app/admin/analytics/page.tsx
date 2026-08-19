"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SummaryTotals = {
  page_views: number;
  unique_visitors: number;
  sessions: number;
  today_page_views: number;
  today_unique_visitors: number;
  returning_visitors: number;
};

type CountItem = {
  label: string;
  count: number;
};

type DailyItem = {
  day: string;
  page_views: number;
  unique_visitors: number;
};

type RecentVisit = {
  created_at: string;
  visitor_id: string;
  path: string;
  referrer_host: string;
  device_type: string;
  browser_name: string;
  os_name: string;
  language: string;
  timezone: string;
  screen_size: string;
  is_returning: boolean;
};

type AnalyticsPayload = {
  period_days: number;
  totals: SummaryTotals;
  top_pages: CountItem[];
  devices: CountItem[];
  browsers: CountItem[];
  operating_systems: CountItem[];
  referrers: CountItem[];
  languages: CountItem[];
  timezones: CountItem[];
  daily: DailyItem[];
  recent: RecentVisit[];
};

const emptyPayload: AnalyticsPayload = {
  period_days: 30,
  totals: {
    page_views: 0,
    unique_visitors: 0,
    sessions: 0,
    today_page_views: 0,
    today_unique_visitors: 0,
    returning_visitors: 0,
  },
  top_pages: [],
  devices: [],
  browsers: [],
  operating_systems: [],
  referrers: [],
  languages: [],
  timezones: [],
  daily: [],
  recent: [],
};

function numberValue(
  value: unknown
) {
  const result =
    Number(value);

  return Number.isFinite(
    result
  )
    ? result
    : 0;
}

function normalizePayload(
  input: unknown
): AnalyticsPayload {
  if (
    !input ||
    typeof input !== "object"
  ) {
    return emptyPayload;
  }

  const value =
    input as Partial<AnalyticsPayload>;

  const totals =
    value.totals ||
    emptyPayload.totals;

  return {
    period_days:
      numberValue(
        value.period_days
      ) || 30,
    totals: {
      page_views:
        numberValue(
          totals.page_views
        ),
      unique_visitors:
        numberValue(
          totals.unique_visitors
        ),
      sessions:
        numberValue(
          totals.sessions
        ),
      today_page_views:
        numberValue(
          totals.today_page_views
        ),
      today_unique_visitors:
        numberValue(
          totals.today_unique_visitors
        ),
      returning_visitors:
        numberValue(
          totals.returning_visitors
        ),
    },
    top_pages:
      Array.isArray(
        value.top_pages
      )
        ? value.top_pages
        : [],
    devices:
      Array.isArray(
        value.devices
      )
        ? value.devices
        : [],
    browsers:
      Array.isArray(
        value.browsers
      )
        ? value.browsers
        : [],
    operating_systems:
      Array.isArray(
        value.operating_systems
      )
        ? value.operating_systems
        : [],
    referrers:
      Array.isArray(
        value.referrers
      )
        ? value.referrers
        : [],
    languages:
      Array.isArray(
        value.languages
      )
        ? value.languages
        : [],
    timezones:
      Array.isArray(
        value.timezones
      )
        ? value.timezones
        : [],
    daily:
      Array.isArray(
        value.daily
      )
        ? value.daily
        : [],
    recent:
      Array.isArray(
        value.recent
      )
        ? value.recent
        : [],
  };
}

function formatDateTime(
  value: string
) {
  try {
    return new Date(
      value
    ).toLocaleString(
      "ar-IQ"
    );
  } catch {
    return value;
  }
}

function shortVisitor(
  value: string
) {
  if (!value) {
    return "—";
  }

  return value
    .replace(
      /-/g,
      ""
    )
    .slice(0, 8)
    .toUpperCase();
}

export default function AdminAnalyticsPage() {
  const router =
    useRouter();

  const [days, setDays] =
    useState(30);

  const [payload, setPayload] =
    useState<AnalyticsPayload>(
      emptyPayload
    );

  const [loading, setLoading] =
    useState(true);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [error, setError] =
    useState("");

  const [adminEmail, setAdminEmail] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState<string | null>(null);

  const [loginEmail, setLoginEmail] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);

  const loadAnalytics =
    useCallback(
      async (
        requestedDays: number
      ) => {
        setLoading(true);
        setError("");

        const {
          data,
          error: rpcError,
        } =
          await supabase.rpc(
            "get_private_site_analytics",
            {
              p_days:
                requestedDays,
            }
          );

        if (rpcError) {
          setError(
            "تعذر تحميل إحصائيات الزوار: " +
              rpcError.message
          );
          setLoading(false);
          return;
        }

        setPayload(
          normalizePayload(data)
        );
        setLoading(false);
      },
      []
    );

  const isAdminUser =
    useCallback(
      async (
        userId: string
      ) => {
        const {
          data,
          error: adminError,
        } =
          await supabase
            .from("admin_users")
            .select("user_id")
            .eq(
              "user_id",
              userId
            )
            .eq(
              "is_active",
              true
            )
            .maybeSingle();

        if (adminError) {
          throw new Error(
            "تعذر التحقق من صلاحية الأدمن: " +
              adminError.message
          );
        }

        return Boolean(data);
      },
      []
    );

  useEffect(() => {
    let mounted = true;

    async function init() {
      setCheckingAuth(true);
      setError("");

      try {
        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(
            sessionError.message
          );
        }

        const user =
          sessionData.session?.user;

        if (!user) {
          if (mounted) {
            setCurrentUser(null);
            setAdminEmail("");
          }
          return;
        }

        const allowed =
          await isAdminUser(
            user.id
          );

        if (!allowed) {
          /*
           * إذا الموجود Session مال طبيب،
           * نطلعه من الحساب ونخليه بصفحة
           * دخول الأدمن بدل ما نرجعه للرئيسية.
           */
          await supabase.auth.signOut();

          if (mounted) {
            setCurrentUser(null);
            setAdminEmail("");
            setError(
              "هذا الحساب مو حساب أدمن. سجل دخول بحساب الأدمن."
            );
          }
          return;
        }

        if (!mounted) {
          return;
        }

        setCurrentUser(
          user.id
        );
        setAdminEmail(
          user.email || ""
        );

        await loadAnalytics(
          days
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        setCurrentUser(null);
        setAdminEmail("");
        setError(
          err instanceof Error
            ? err.message
            : "تعذر فتح لوحة الزوار."
        );
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    }

    void init();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          if (!mounted) {
            return;
          }

          const user =
            session?.user;

          if (!user) {
            setCurrentUser(null);
            setAdminEmail("");
            setPayload(
              emptyPayload
            );
            return;
          }

          try {
            const allowed =
              await isAdminUser(
                user.id
              );

            if (!allowed) {
              await supabase.auth.signOut();
              setCurrentUser(null);
              setAdminEmail("");
              setPayload(
                emptyPayload
              );
              setError(
                "هذا الحساب مو حساب أدمن. سجل دخول بحساب الأدمن."
              );
              return;
            }

            setCurrentUser(
              user.id
            );
            setAdminEmail(
              user.email || ""
            );
            setError("");

            await loadAnalytics(
              days
            );
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "تعذر التحقق من حساب الأدمن."
            );
          }
        }
      );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [
    isAdminUser,
    loadAnalytics,
  ]);

  async function handleAdminLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !loginEmail.trim() ||
      !loginPassword
    ) {
      setError(
        "اكتب إيميل وباسورد الأدمن."
      );
      return;
    }

    setLoginLoading(true);
    setError("");

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email:
            loginEmail.trim(),
          password:
            loginPassword,
        });

      if (
        loginError ||
        !data.user
      ) {
        throw new Error(
          loginError?.message ||
            "فشل تسجيل الدخول."
        );
      }

      const allowed =
        await isAdminUser(
          data.user.id
        );

      if (!allowed) {
        await supabase.auth.signOut();
        throw new Error(
          "هذا الحساب مو حساب أدمن."
        );
      }

      setCurrentUser(
        data.user.id
      );
      setAdminEmail(
        data.user.email || ""
      );
      setLoginPassword("");
      setError("");

      await loadAnalytics(
        days
      );
    } catch (err) {
      setCurrentUser(null);
      setAdminEmail("");
      setError(
        err instanceof Error
          ? err.message
          : "فشل تسجيل دخول الأدمن."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAdminEmail("");
    setPayload(
      emptyPayload
    );
  }

  const maxDaily =
    useMemo(
      () =>
        Math.max(
          1,
          ...payload.daily.map(
            (item) =>
              numberValue(
                item.page_views
              )
          )
        ),
      [payload.daily]
    );

  async function changePeriod(
    nextDays: number
  ) {
    setDays(nextDays);
    await loadAnalytics(
      nextDays
    );
  }

  if (checkingAuth) {
    return (
      <main
        dir="rtl"
        style={page}
      >
        <div style={centerBox}>
          جاري التحقق من صلاحية الأدمن...
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main
        dir="rtl"
        style={page}
      >
        <div
          style={{
            ...centerBox,
            maxWidth: 460,
          }}
        >
          <small style={eyebrow}>
            ADMIN ONLY
          </small>

          <h1
            style={{
              ...title,
              fontSize: 34,
            }}
          >
            دخول إحصائيات الزوار
          </h1>

          <p style={muted}>
            هاي الصفحة خاصة بالأدمن فقط.
          </p>

          {error && (
            <div
              style={{
                ...errorBox,
                marginTop: 16,
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleAdminLogin
            }
            style={{
              display: "grid",
              gap: 10,
              marginTop: 20,
            }}
          >
            <input
              type="email"
              value={loginEmail}
              onChange={(event) =>
                setLoginEmail(
                  event.target.value
                )
              }
              placeholder="إيميل الأدمن"
              autoComplete="email"
              style={loginInput}
            />

            <input
              type="password"
              value={loginPassword}
              onChange={(event) =>
                setLoginPassword(
                  event.target.value
                )
              }
              placeholder="كلمة السر"
              autoComplete="current-password"
              style={loginInput}
            />

            <button
              type="submit"
              disabled={
                loginLoading
              }
              style={loginButton}
            >
              {loginLoading
                ? "جاري الدخول..."
                : "دخول الأدمن"}
            </button>
          </form>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            style={{
              ...secondaryButton,
              width: "100%",
              marginTop: 10,
            }}
          >
            رجوع للرئيسية
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      style={page}
    >
      <div style={container}>
        <header style={header}>
          <div>
            <small style={eyebrow}>
              PRIVATE ANALYTICS
            </small>

            <h1 style={title}>
              إحصائيات زوار موقعك
            </h1>

            <p style={muted}>
              خاصة بحساب الأدمن فقط. لا نخزن اسم الزائر
              ولا رقم هاتفه ولا عنوان IP.
            </p>

            {adminEmail && (
              <small
                style={adminBadge}
              >
                ● الأدمن: {adminEmail}
              </small>
            )}
          </div>

          <div style={headerActions}>
            <button
              type="button"
              style={{
                ...secondaryButton,
                color: "#ff9b9b",
                border:
                  "1px solid rgba(255,100,100,.18)",
              }}
              onClick={
                handleLogout
              }
            >
              تسجيل الخروج
            </button>

            <button
              type="button"
              style={secondaryButton}
              onClick={() =>
                router.push(
                  "/admin/subscriptions"
                )
              }
            >
              إدارة الاشتراكات
            </button>

            <button
              type="button"
              style={secondaryButton}
              disabled={loading}
              onClick={() =>
                loadAnalytics(
                  days
                )
              }
            >
              {loading
                ? "جاري التحديث..."
                : "تحديث"}
            </button>

            <button
              type="button"
              style={secondaryButton}
              onClick={() =>
                router.push("/")
              }
            >
              الرئيسية
            </button>
          </div>
        </header>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <section style={periodBar}>
          <span
            style={{
              color:
                "rgba(255,255,255,.5)",
              fontSize: 11,
            }}
          >
            الفترة:
          </span>

          {[7, 30, 90].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  changePeriod(
                    item
                  )
                }
                style={
                  item === days
                    ? activePeriod
                    : periodButton
                }
              >
                {item} يوم
              </button>
            )
          )}
        </section>

        <section
          style={statsGrid}
        >
          <Stat
            title="مشاهدات الصفحات"
            value={
              payload.totals
                .page_views
            }
          />

          <Stat
            title="زوار مختلفون تقريباً"
            value={
              payload.totals
                .unique_visitors
            }
          />

          <Stat
            title="الجلسات"
            value={
              payload.totals
                .sessions
            }
          />

          <Stat
            title="مشاهدات اليوم"
            value={
              payload.totals
                .today_page_views
            }
          />

          <Stat
            title="زوار اليوم"
            value={
              payload.totals
                .today_unique_visitors
            }
          />

          <Stat
            title="زوار راجعين"
            value={
              payload.totals
                .returning_visitors
            }
          />
        </section>

        <section style={panel}>
          <div style={panelHeader}>
            <div>
              <small style={eyebrow}>
                TRAFFIC TREND
              </small>
              <h2 style={sectionTitle}>
                حركة الزيارات
              </h2>
            </div>

            <span style={countBadge}>
              آخر {days} يوم
            </span>
          </div>

          {payload.daily.length ===
          0 ? (
            <div style={empty}>
              ماكو بيانات بعد.
            </div>
          ) : (
            <div style={chartList}>
              {payload.daily.map(
                (item) => {
                  const value =
                    numberValue(
                      item.page_views
                    );

                  const width =
                    Math.max(
                      3,
                      (value /
                        maxDaily) *
                        100
                    );

                  return (
                    <div
                      key={item.day}
                      style={
                        chartRow
                      }
                    >
                      <span
                        style={
                          chartDate
                        }
                      >
                        {item.day}
                      </span>

                      <div
                        style={
                          chartTrack
                        }
                      >
                        <div
                          style={{
                            ...chartFill,
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <strong
                        style={
                          chartValue
                        }
                      >
                        {value}
                      </strong>

                      <small
                        style={
                          chartUnique
                        }
                      >
                        {
                          item.unique_visitors
                        }{" "}
                        زائر
                      </small>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section style={twoColumns}>
          <BreakdownPanel
            title="أكثر الصفحات مشاهدة"
            items={
              payload.top_pages
            }
          />

          <BreakdownPanel
            title="الأجهزة"
            items={
              payload.devices
            }
          />

          <BreakdownPanel
            title="المتصفحات"
            items={
              payload.browsers
            }
          />

          <BreakdownPanel
            title="أنظمة التشغيل"
            items={
              payload.operating_systems
            }
          />

          <BreakdownPanel
            title="مصادر الزيارات"
            items={
              payload.referrers
            }
          />

          <BreakdownPanel
            title="المناطق الزمنية"
            items={
              payload.timezones
            }
          />
        </section>

        <section style={panel}>
          <div style={panelHeader}>
            <div>
              <small style={eyebrow}>
                RECENT VISITS
              </small>

              <h2 style={sectionTitle}>
                آخر الزيارات
              </h2>
            </div>

            <span style={countBadge}>
              معرفات مجهولة فقط
            </span>
          </div>

          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>
                    الوقت
                  </th>
                  <th style={th}>
                    الزائر
                  </th>
                  <th style={th}>
                    الصفحة
                  </th>
                  <th style={th}>
                    الجهاز
                  </th>
                  <th style={th}>
                    المتصفح
                  </th>
                  <th style={th}>
                    المصدر
                  </th>
                  <th style={th}>
                    المنطقة الزمنية
                  </th>
                  <th style={th}>
                    الحالة
                  </th>
                </tr>
              </thead>

              <tbody>
                {payload.recent.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={`${item.created_at}-${index}`}
                    >
                      <td style={td}>
                        {formatDateTime(
                          item.created_at
                        )}
                      </td>

                      <td style={td}>
                        <code
                          style={
                            visitorCode
                          }
                        >
                          {shortVisitor(
                            item.visitor_id
                          )}
                        </code>
                      </td>

                      <td style={td}>
                        {item.path}
                      </td>

                      <td style={td}>
                        {item.device_type}
                        <small
                          style={
                            smallText
                          }
                        >
                          {item.os_name}
                        </small>
                      </td>

                      <td style={td}>
                        {item.browser_name}
                        <small
                          style={
                            smallText
                          }
                        >
                          {item.screen_size}
                        </small>
                      </td>

                      <td style={td}>
                        {item.referrer_host}
                      </td>

                      <td style={td}>
                        {item.timezone}
                        <small
                          style={
                            smallText
                          }
                        >
                          {item.language}
                        </small>
                      </td>

                      <td style={td}>
                        <span
                          style={
                            item.is_returning
                              ? returningBadge
                              : newBadge
                          }
                        >
                          {item.is_returning
                            ? "راجع"
                            : "جديد"}
                        </span>
                      </td>
                    </tr>
                  )
                )}

                {payload.recent.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        ...td,
                        textAlign:
                          "center",
                        padding: 30,
                      }}
                    >
                      ماكو زيارات مسجلة بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div style={privacyBox}>
          <strong>
            الخصوصية
          </strong>

          <p>
            هذا النظام يعطيك إحصائيات مجهولة: معرف عشوائي
            للمتصفح، الصفحات، الجهاز، المتصفح، اللغة والمنطقة
            الزمنية. ما يخزن IP ولا اسم الشخص ولا رقم هاتفه،
            لذلك تعرف سلوك الزوار بدون ما تتحول المنصة إلى
            نظام مراقبة للأشخاص.
          </p>
        </div>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <article style={statCard}>
      <small style={statTitle}>
        {title}
      </small>

      <strong style={statValue}>
        {numberValue(
          value
        ).toLocaleString(
          "en-US"
        )}
      </strong>
    </article>
  );
}

function BreakdownPanel({
  title,
  items,
}: {
  title: string;
  items: CountItem[];
}) {
  const maxValue =
    Math.max(
      1,
      ...items.map(
        (item) =>
          numberValue(
            item.count
          )
      )
    );

  return (
    <article style={panel}>
      <h2
        style={{
          ...sectionTitle,
          fontSize: 20,
        }}
      >
        {title}
      </h2>

      {items.length === 0 ? (
        <div style={empty}>
          ماكو بيانات بعد.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 11,
            marginTop: 16,
          }}
        >
          {items
            .slice(0, 10)
            .map(
              (item) => {
                const value =
                  numberValue(
                    item.count
                  );

                return (
                  <div
                    key={
                      item.label
                    }
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: 12,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          color:
                            "rgba(255,255,255,.68)",
                          fontSize: 11,
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {item.label ||
                          "غير معروف"}
                      </span>

                      <strong
                        style={{
                          color:
                            "#32baff",
                          fontSize: 11,
                        }}
                      >
                        {value}
                      </strong>
                    </div>

                    <div
                      style={
                        miniTrack
                      }
                    >
                      <div
                        style={{
                          ...miniFill,
                          width: `${
                            (value /
                              maxValue) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
        </div>
      )}
    </article>
  );
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 15% 5%,rgba(50,186,255,.10),transparent 26%),#02070e",
  color: "#fff",
  fontFamily:
    "Arial, sans-serif",
};

const container = {
  width: "min(1380px,94%)",
  margin: "0 auto",
  padding: "34px 0 70px",
};

const centerBox = {
  width: "min(520px,90%)",
  margin: "100px auto",
  padding: 30,
  textAlign:
    "center" as const,
  border:
    "1px solid rgba(50,186,255,.16)",
  background:
    "rgba(0,10,20,.72)",
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-start",
  gap: 20,
  flexWrap:
    "wrap" as const,
  marginBottom: 24,
};

const headerActions = {
  display: "flex",
  gap: 8,
  flexWrap:
    "wrap" as const,
};

const eyebrow = {
  color: "#c7a85d",
  fontSize: 9,
  letterSpacing: ".18em",
};

const title = {
  margin: "8px 0 8px",
  fontSize:
    "clamp(32px,5vw,58px)",
  lineHeight: 1.05,
  fontWeight: 500,
};

const muted = {
  maxWidth: 720,
  margin: 0,
  color:
    "rgba(255,255,255,.48)",
  fontSize: 11,
  lineHeight: 1.9,
};

const adminBadge = {
  display: "inline-block",
  marginTop: 12,
  padding: "7px 10px",
  color: "#62e89a",
  fontSize: 9,
  border:
    "1px solid rgba(98,232,154,.18)",
  background:
    "rgba(98,232,154,.04)",
};

const secondaryButton = {
  padding: "11px 13px",
  color: "#fff",
  border:
    "1px solid rgba(255,255,255,.11)",
  background:
    "rgba(255,255,255,.025)",
  cursor: "pointer",
};

const periodBar = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap:
    "wrap" as const,
  padding: 13,
  marginBottom: 18,
  border:
    "1px solid rgba(255,255,255,.07)",
  background:
    "rgba(255,255,255,.018)",
};

const periodButton = {
  padding: "8px 11px",
  color:
    "rgba(255,255,255,.62)",
  border:
    "1px solid rgba(255,255,255,.08)",
  background:
    "transparent",
  cursor: "pointer",
};

const activePeriod = {
  ...periodButton,
  color: "#061018",
  border:
    "1px solid #32baff",
  background:
    "#32baff",
  fontWeight: 700,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(160px,1fr))",
  gap: 10,
  marginBottom: 18,
};

const statCard = {
  minHeight: 116,
  padding: 17,
  border:
    "1px solid rgba(50,186,255,.12)",
  background:
    "linear-gradient(145deg,rgba(50,186,255,.045),rgba(0,0,0,.16))",
};

const statTitle = {
  display: "block",
  color:
    "rgba(255,255,255,.45)",
  fontSize: 9,
  lineHeight: 1.6,
};

const statValue = {
  display: "block",
  marginTop: 18,
  color: "#fff",
  fontSize: 34,
  lineHeight: 1,
};

const panel = {
  padding: 20,
  border:
    "1px solid rgba(255,255,255,.075)",
  background:
    "rgba(3,11,21,.74)",
};

const panelHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-start",
  gap: 14,
  flexWrap:
    "wrap" as const,
  marginBottom: 17,
};

const sectionTitle = {
  margin: "7px 0 0",
  color: "#fff",
  fontSize: 26,
  fontWeight: 500,
};

const countBadge = {
  padding: "7px 9px",
  color: "#32baff",
  fontSize: 9,
  border:
    "1px solid rgba(50,186,255,.16)",
  background:
    "rgba(50,186,255,.04)",
};

const twoColumns = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: 12,
  margin: "18px 0",
};

const chartList = {
  display: "grid",
  gap: 9,
};

const chartRow = {
  display: "grid",
  gridTemplateColumns:
    "90px minmax(120px,1fr) 55px 70px",
  gap: 10,
  alignItems: "center",
};

const chartDate = {
  color:
    "rgba(255,255,255,.52)",
  fontSize: 9,
};

const chartTrack = {
  height: 8,
  overflow: "hidden",
  background:
    "rgba(255,255,255,.05)",
};

const chartFill = {
  height: "100%",
  background:
    "linear-gradient(90deg,#32baff,#6dd6ff)",
};

const chartValue = {
  color: "#fff",
  fontSize: 11,
  textAlign:
    "left" as const,
};

const chartUnique = {
  color:
    "rgba(255,255,255,.38)",
  fontSize: 8,
};

const miniTrack = {
  height: 5,
  overflow: "hidden",
  background:
    "rgba(255,255,255,.05)",
};

const miniFill = {
  height: "100%",
  background:
    "#32baff",
};

const tableWrap = {
  overflowX:
    "auto" as const,
};

const table = {
  width: "100%",
  minWidth: 980,
  borderCollapse:
    "collapse" as const,
};

const th = {
  padding: "10px 11px",
  textAlign:
    "right" as const,
  color:
    "rgba(255,255,255,.42)",
  fontSize: 9,
  fontWeight: 500,
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const td = {
  padding: "12px 11px",
  color:
    "rgba(255,255,255,.68)",
  fontSize: 10,
  verticalAlign:
    "top" as const,
  borderBottom:
    "1px solid rgba(255,255,255,.05)",
};

const smallText = {
  display: "block",
  marginTop: 4,
  color:
    "rgba(255,255,255,.32)",
  fontSize: 8,
};

const visitorCode = {
  padding: "4px 6px",
  color: "#32baff",
  background:
    "rgba(50,186,255,.06)",
  border:
    "1px solid rgba(50,186,255,.12)",
};

const returningBadge = {
  display: "inline-block",
  padding: "5px 7px",
  color: "#c7a85d",
  border:
    "1px solid rgba(199,168,93,.16)",
  background:
    "rgba(199,168,93,.04)",
  fontSize: 8,
};

const newBadge = {
  display: "inline-block",
  padding: "5px 7px",
  color: "#62e89a",
  border:
    "1px solid rgba(98,232,154,.16)",
  background:
    "rgba(98,232,154,.04)",
  fontSize: 8,
};

const empty = {
  padding: 22,
  color:
    "rgba(255,255,255,.38)",
  textAlign:
    "center" as const,
  border:
    "1px dashed rgba(255,255,255,.07)",
};

const errorBox = {
  marginBottom: 16,
  padding: 14,
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,100,100,.22)",
  background:
    "rgba(255,80,80,.05)",
};

const privacyBox = {
  marginTop: 18,
  padding: 17,
  color:
    "rgba(255,255,255,.5)",
  fontSize: 10,
  lineHeight: 1.9,
  border:
    "1px solid rgba(98,232,154,.12)",
  background:
    "rgba(98,232,154,.025)",
};


const loginInput = {
  width: "100%",
  boxSizing:
    "border-box" as const,
  padding: "13px 14px",
  color: "#fff",
  outline: "none",
  border:
    "1px solid rgba(255,255,255,.10)",
  background:
    "rgba(255,255,255,.035)",
};

const loginButton = {
  width: "100%",
  padding: "13px 14px",
  color: "#061018",
  border:
    "1px solid #32baff",
  background: "#32baff",
  fontWeight: 800,
  cursor: "pointer",
};