"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

type Theme =
  | "dark-blue"
  | "black-gold"
  | "clean-white";

type DemoCase = {
  title: string;
  description: string;
  category: string;
};

const demoCases: DemoCase[] = [
  {
    title: "Smile Transformation",
    description:
      "نموذج توضيحي لطريقة عرض الحالة قبل وبعد داخل الباقة المميزة.",
    category: "تجميل",
  },
  {
    title: "Whitening Case",
    description:
      "عرض احترافي وسريع للحالات على الهاتف والكمبيوتر.",
    category: "تبييض",
  },
  {
    title: "Aesthetic Dentistry",
    description:
      "الحالات تظهر أفقياً على الهاتف حتى يبقى التصفح خفيفاً.",
    category: "ترميمات تجميلية",
  },
];

const services = [
  "زراعة الأسنان",
  "ابتسامة هوليود",
  "تبييض الأسنان",
  "علاج الجذور",
  "التقويم",
  "طب الأسنان التجميلي",
];

const reviews = [
  {
    name: "مريض تجريبي",
    rating: 5,
    text:
      "تصميم مرتب وسهل، وكل معلومات الطبيب واضحة بمكان واحد.",
  },
  {
    name: "مراجعة تجريبية",
    rating: 5,
    text:
      "طريقة عرض الحالات قبل وبعد مريحة جداً على الهاتف.",
  },
  {
    name: "تقييم تجريبي",
    rating: 4,
    text:
      "وجود الموقع والدوام ووسائل التواصل يخلي الوصول للعيادة أسرع.",
  },
];

function BeforeAfterDemo({
  item,
}: {
  item: DemoCase;
}) {
  const [position, setPosition] =
    useState(52);

  return (
    <article className="demo-case-card">
      <div className="demo-slider">
        <div className="demo-after">
          <div>
            <div className="demo-tooth">
              🦷
            </div>
            <strong>AFTER</strong>
          </div>
        </div>

        <div
          className="demo-before"
          style={{
            clipPath: `inset(0 ${
              100 - position
            }% 0 0)`,
          }}
        >
          <div>
            <div className="demo-tooth demo-tooth-before">
              🦷
            </div>
            <strong>BEFORE</strong>
          </div>
        </div>

        <div
          className="demo-divider"
          style={{
            left: `${position}%`,
          }}
        >
          <span>↔</span>
        </div>

        <input
          aria-label="اسحب للمقارنة بين قبل وبعد"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) =>
            setPosition(
              Number(
                event.target.value
              )
            )
          }
        />
      </div>

      <div className="demo-case-content">
        <span>
          BEFORE / AFTER • {item.category}
        </span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}

export default function PremiumDemoPage() {
  const router = useRouter();

  const [theme, setTheme] =
    useState<Theme>("dark-blue");

  const [demoUrl, setDemoUrl] =
    useState(
      "https://adam-designe.netlify.app/demo-premium"
    );
  const [search, setSearch] =
    useState("");
  const [category, setCategory] =
    useState("الكل");
  const [saved, setSaved] =
    useState(false);
  const [demoMessage, setDemoMessage] =
    useState("");

  useEffect(() => {
    if (
      typeof window !==
      "undefined"
    ) {
      setDemoUrl(
        `${window.location.origin}/demo-premium`
      );
    }
  }, []);

  const categories = [
    "الكل",
    ...Array.from(
      new Set(
        demoCases.map(
          (item) =>
            item.category
        )
      )
    ),
  ];

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  const filteredCases =
    demoCases.filter(
      (item) =>
        (
          category === "الكل" ||
          item.category ===
            category
        ) &&
        (
          !normalizedSearch ||
          [
            item.title,
            item.description,
            item.category,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch
            )
        )
    );

  const filteredServices =
    services.filter(
      (service) =>
        !normalizedSearch ||
        service
          .toLowerCase()
          .includes(
            normalizedSearch
          )
    );

  const average = (
    reviews.reduce(
      (sum, item) =>
        sum + item.rating,
      0
    ) / reviews.length
  ).toFixed(1);

  function subscribePremium() {
    router.push(
      "/subscription?plan=premium"
    );
  }

  return (
    <main
      className="premium-demo"
      data-theme={theme}
      dir="rtl"
    >
      <header className="demo-nav">
        <button
          type="button"
          className="demo-nav-secondary"
          onClick={() =>
            router.push("/")
          }
        >
          ← الرئيسية
        </button>

        <div className="demo-brand">
          <strong>
            PREMIUM DEMO
          </strong>
          <small>ADAM DESIGN</small>
        </div>

        <button
          type="button"
          className="demo-primary-button demo-nav-cta"
          onClick={subscribePremium}
        >
          اشترك بالمميز
        </button>
      </header>

      <section className="demo-section demo-hero">
        <div className="demo-hero-grid">
          <div>
            <span className="demo-eyebrow">
              نموذج توضيحي للباقة المميزة
            </span>

            <h1>
              موقع طبيب
              <br />
              <em>
                يبين احترافي.
              </em>
            </h1>

            <p className="demo-lead">
              هذا نموذج غير حقيقي حتى تشوف شكل الموقع المميز بعد
              كل الإضافات: Cover وLogo، عروض مؤقتة، بحث وفلترة،
              حجز موعد ذكي، FAQ، Reviews، QR، إحصائيات أعمق،
              حفظ ومشاركة الطبيب، SEO وثيمات متعددة.
            </p>

            <div className="demo-actions">
              <button
                type="button"
                className="demo-primary-button"
                onClick={subscribePremium}
              >
                أريد موقع مثل هذا
              </button>

              <button
                type="button"
                className="demo-secondary-button"
                onClick={() =>
                  document
                    .getElementById(
                      "demo-cases"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              >
                شاهد الحالات ↓
              </button>
            </div>
          </div>

          <div className="demo-doctor-card">
            <div
              style={{
                height: 140,
                marginBottom: 14,
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg,var(--demo-panel),rgba(0,0,0,.42))",
                border:
                  "1px solid var(--demo-border)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  color:
                    "var(--demo-muted)",
                  opacity: .24,
                  fontSize: 44,
                  letterSpacing: ".12em",
                }}
              >
                CLINIC COVER
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 66,
                  height: 66,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 16,
                  color:
                    "var(--demo-accent)",
                  background:
                    "var(--demo-panel)",
                  border:
                    "1px solid var(--demo-border)",
                  fontWeight: 900,
                }}
              >
                LOGO
              </div>

              <div className="demo-doctor-photo">
                <span>DR</span>
              </div>
            </div>

            <span className="demo-eyebrow">
              AESTHETIC DENTISTRY
            </span>

            <h2>
              د. أحمد — DEMO
            </h2>

            <p>
              صفحة تجريبية وليست ملف طبيب حقيقي
            </p>

            <div className="demo-mini-badges">
              <span>Premium</span>
              <span>Baghdad</span>
              <span>12 Years</span>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-panel">
          <span className="demo-eyebrow">
            LIVE THEME PREVIEW
          </span>

          <h2 className="demo-section-title">
            جرّب الثيم بنفسك
          </h2>

          <div className="demo-theme-grid">
            {[
              {
                id:
                  "dark-blue" as Theme,
                label:
                  "Dark Blue",
                description:
                  "أزرق طبي عصري",
              },
              {
                id:
                  "black-gold" as Theme,
                label:
                  "Black & Gold",
                description:
                  "أسود وذهبي فاخر",
              },
              {
                id:
                  "clean-white" as Theme,
                label:
                  "Clean White",
                description:
                  "أبيض طبي نظيف",
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`demo-theme-card theme-card-${item.id} ${
                  theme === item.id
                    ? "demo-theme-selected"
                    : ""
                }`}
                onClick={() =>
                  setTheme(item.id)
                }
              >
                <strong>
                  {item.label}
                </strong>

                <small>
                  {theme ===
                  item.id
                    ? "الثيم الحالي"
                    : item.description}
                </small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="demo-section">
        <div
          className="demo-panel"
          style={{
            border:
              "1px solid rgba(255,184,77,.24)",
            background:
              "linear-gradient(135deg,rgba(255,184,77,.07),var(--demo-surface))",
          }}
        >
          <span
            className="demo-eyebrow"
            style={{
              color: "#ffbf69",
            }}
          >
            LIMITED OFFER
          </span>

          <h2 className="demo-section-title">
            عرض مؤقت بالعيادة
          </h2>

          <p>
            خصم تجريبي 20% على ابتسامة هوليود — الطبيب يحدد تاريخ
            الانتهاء والعرض يختفي تلقائياً بعده.
          </p>

          <small
            style={{
              color: "#ffbf69",
            }}
          >
            متاح لغاية 31 / 12
          </small>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-panel">
          <span className="demo-eyebrow">
            QUICK ACTIONS
          </span>

          <h2 className="demo-section-title">
            اتصال • مشاركة • حفظ الطبيب
          </h2>

          <div className="demo-actions">
            <button
              type="button"
              className="demo-secondary-button"
              onClick={() =>
                setDemoMessage(
                  "Demo: بالموقع الحقيقي يفتح الاتصال مباشرة."
                )
              }
            >
              ☎ اتصال مباشر
            </button>

            <button
              type="button"
              className="demo-secondary-button"
              onClick={() =>
                setDemoMessage(
                  "تم نسخ عنوان العيادة — Demo"
                )
              }
            >
              📋 نسخ العنوان
            </button>

            <button
              type="button"
              className="demo-secondary-button"
              onClick={() =>
                setDemoMessage(
                  "Demo: الموقع الحقيقي يدعم مشاركة الرابط والصورة."
                )
              }
            >
              ↗ مشاركة الموقع
            </button>

            <button
              type="button"
              className="demo-secondary-button"
              onClick={() => {
                setSaved(
                  (old) =>
                    !old
                );
                setDemoMessage(
                  saved
                    ? "تمت إزالة الطبيب من المحفوظات."
                    : "تم حفظ الطبيب على هذا الجهاز — Demo"
                );
              }}
            >
              {saved
                ? "★ محفوظ"
                : "☆ احفظ الطبيب"}
            </button>
          </div>

          {demoMessage && (
            <p
              style={{
                color:
                  "var(--demo-accent)",
                marginTop: 12,
              }}
            >
              {demoMessage}
            </p>
          )}
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-panel">
          <span className="demo-eyebrow">
            SMART APPOINTMENT
          </span>

          <h2 className="demo-section-title">
            حجز موعد ذكي
          </h2>

          <div className="demo-info-grid">
            <div className="demo-panel">
              <strong>الاسم</strong>
              <p>علي محمد</p>
            </div>
            <div className="demo-panel">
              <strong>الخدمة</strong>
              <p>ابتسامة هوليود</p>
            </div>
            <div className="demo-panel">
              <strong>الموعد المفضل</strong>
              <p>الأحد • 6:30 PM</p>
            </div>
          </div>

          <button
            type="button"
            className="demo-primary-button"
            style={{
              marginTop: 14,
            }}
            onClick={() =>
              setDemoMessage(
                "بالموقع الحقيقي تنفتح رسالة WhatsApp جاهزة بكل تفاصيل الموعد."
              )
            }
          >
            إرسال طلب الموعد عبر WhatsApp
          </button>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-panel">
          <span className="demo-eyebrow">
            FAQ
          </span>

          <h2 className="demo-section-title">
            الأسئلة الشائعة
          </h2>

          {[
            [
              "هل التبييض مؤلم؟",
              "يعتمد على الحالة، والطبيب يوضح الخطة المناسبة بعد الفحص.",
            ],
            [
              "هل الحجز مسبق؟",
              "نعم، تقدر ترسل طلب موعد من نفس صفحة الطبيب.",
            ],
          ].map(
            ([question, answer]) => (
              <details
                key={question}
                style={{
                  padding: 13,
                  marginTop: 8,
                  border:
                    "1px solid var(--demo-border)",
                  background:
                    "var(--demo-panel)",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    color:
                      "var(--demo-text)",
                    fontWeight: 700,
                  }}
                >
                  {question}
                </summary>
                <p>
                  {answer}
                </p>
              </details>
            )
          )}
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-info-grid">
          <div className="demo-panel">
            <span className="demo-eyebrow">
              WORKING HOURS
            </span>
            <h3>
              أوقات الدوام
            </h3>
            <p>
              السبت — الخميس
              <br />
              4:00 PM — 9:00 PM
            </p>
          </div>

          <div className="demo-panel">
            <span className="demo-eyebrow">
              LOCATION
            </span>
            <h3>
              📍 موقع العيادة
            </h3>
            <p>
              زر مباشر يفتح Google Maps للمريض.
            </p>
          </div>

          <div className="demo-panel">
            <span className="demo-eyebrow">
              SOCIAL
            </span>
            <h3>
              تابع الطبيب
            </h3>

            <div className="demo-socials">
              <span>Instagram</span>
              <span>TikTok</span>
              <span>Facebook</span>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <span className="demo-eyebrow">
          SERVICES
        </span>

        <h2 className="demo-big-title">
          خدمات الطبيب
        </h2>

        <div className="demo-services-scroller">
          {filteredServices.map(
            (service) => (
              <div
                key={service}
                className="demo-service-card"
              >
                <span>+</span>
                {service}
              </div>
            )
          )}
        </div>
      </section>

      <section
        className="demo-section"
      >
        <div className="demo-panel">
          <span className="demo-eyebrow">
            SEARCH & FILTER
          </span>

          <h2 className="demo-section-title">
            بحث وفلترة الحالات والخدمات
          </h2>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="ابحث: تبييض، تجميل، زراعة..."
            style={{
              width: "100%",
              padding: "12px 14px",
              color:
                "var(--demo-text)",
              background:
                "var(--demo-panel)",
              border:
                "1px solid var(--demo-border)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <div
            className="demo-actions"
            style={{
              marginTop: 10,
            }}
          >
            {categories.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? "demo-primary-button"
                      : "demo-secondary-button"
                  }
                  onClick={() =>
                    setCategory(
                      item
                    )
                  }
                >
                  {item}
                </button>
              )
            )}
          </div>

          <p className="demo-footnote">
            النتائج: {filteredCases.length} حالة • {filteredServices.length} خدمة
          </p>
        </div>
      </section>

      <section
        id="demo-cases"
        className="demo-section"
      >
        <span className="demo-eyebrow">
          SELECTED WORK
        </span>

        <h2 className="demo-big-title">
          Before / After
        </h2>

        <div className="demo-cases-scroller">
          {filteredCases.map(
            (item) => (
              <BeforeAfterDemo
                key={item.title}
                item={item}
              />
            )
          )}
        </div>

        <p className="demo-footnote">
          * الصور هنا عناصر توضيحية للـDemo وليست حالات طبية حقيقية.
        </p>
      </section>

      <section className="demo-section">
        <div className="demo-panel">
          <div className="demo-reviews-header">
            <div>
              <span className="demo-eyebrow">
                PATIENT REVIEWS
              </span>
              <h2 className="demo-section-title">
                آراء المرضى
              </h2>
            </div>

            <div className="demo-rating-box">
              <strong>
                {average}
              </strong>
              <span>
                ★★★★★
              </span>
            </div>
          </div>

          <div className="demo-reviews-scroller">
            {reviews.map(
              (review) => (
                <article
                  key={review.name}
                  className="demo-review-card"
                >
                  <div className="demo-stars">
                    {"★".repeat(
                      review.rating
                    )}
                    <span>
                      {"★".repeat(
                        5 -
                          review.rating
                      )}
                    </span>
                  </div>

                  <p>
                    “{review.text}”
                  </p>

                  <strong>
                    {review.name}
                  </strong>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-premium-tools">
          <div>
            <span className="demo-eyebrow">
              PREMIUM TOOLS
            </span>

            <h2 className="demo-section-title">
              QR + إحصائيات الموقع
            </h2>

            <div className="demo-stats-grid">
              {[
                [
                  "1,284",
                  "زيارة",
                ],
                [
                  "164",
                  "ضغطات WhatsApp",
                ],
                [
                  "18",
                  "رأي منشور",
                ],
                [
                  "73",
                  "حالة منشورة",
                ],
              ].map(
                ([value, label]) => (
                  <div
                    key={label}
                    className="demo-stat-card"
                  >
                    <strong>
                      {value}
                    </strong>
                    <small>
                      {label}
                    </small>
                  </div>
                )
              )}
            </div>

            <p className="demo-footnote">
              الأرقام أعلاه Demo فقط لتوضيح شكل الإحصائيات.
            </p>

            <div
              className="demo-info-grid"
              style={{
                marginTop: 14,
              }}
            >
              <div className="demo-panel">
                <span className="demo-eyebrow">
                  TOP SECTIONS
                </span>
                <h3>
                  أكثر الأقسام تفاعلاً
                </h3>
                <p>
                  الحالات 48 • الخدمات 31 • الآراء 19
                </p>
              </div>

              <div className="demo-panel">
                <span className="demo-eyebrow">
                  TOP SERVICES
                </span>
                <h3>
                  أكثر الخدمات المطلوبة
                </h3>
                <p>
                  تبييض 22 • تجميل 18 • زراعة 11
                </p>
              </div>

              <div className="demo-panel">
                <span className="demo-eyebrow">
                  APPOINTMENTS
                </span>
                <h3>
                  طلبات المواعيد
                </h3>
                <p>
                  37 طلب موعد من الموقع
                </p>
              </div>
            </div>
          </div>

          <div className="demo-qr">
            <QRCode
              value={demoUrl}
              size={202}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-panel">
          <span className="demo-eyebrow">
            DASHBOARD PREVIEW
          </span>

          <h2 className="demo-section-title">
            إشعارات الطبيب
          </h2>

          <div className="demo-info-grid">
            <div className="demo-panel">
              <strong>
                3 آراء جديدة
              </strong>
              <p>
                بانتظار مراجعة الطبيب.
              </p>
            </div>

            <div className="demo-panel">
              <strong>
                باقي 6 أيام
              </strong>
              <p>
                تنبيه قبل انتهاء الاشتراك.
              </p>
            </div>

            <div className="demo-panel">
              <strong>
                SEO + مشاركة احترافية
              </strong>
              <p>
                اسم الطبيب واختصاصه وصورته تظهر عند مشاركة الرابط،
                مع بيانات منظمة لمحركات البحث.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section demo-final-section">
        <div className="demo-final-cta">
          <span className="demo-eyebrow">
            PREMIUM • 50,000 IQD
          </span>

          <h2>
            تريد موقعك يطلع بهذا المستوى؟
          </h2>

          <p>
            اختر الباقة المميزة، وبعد الموافقة تسجل وتبني موقعك من
            لوحة الطبيب بنفسك.
          </p>

          <button
            type="button"
            className="demo-primary-button"
            onClick={subscribePremium}
          >
            اشترك بالباقة المميزة ↗
          </button>
        </div>
      </section>

      <style jsx global>{`
        .premium-demo {
          --demo-bg: #02070e;
          --demo-surface: rgba(4,14,25,.95);
          --demo-panel: rgba(50,186,255,.045);
          --demo-accent: #32baff;
          --demo-text: #ffffff;
          --demo-muted: rgba(255,255,255,.56);
          --demo-border: rgba(50,186,255,.18);
          min-height: 100vh;
          background:
            radial-gradient(circle at 18% 7%, rgba(50,186,255,.12), transparent 27%),
            var(--demo-bg);
          color: var(--demo-text);
          transition:
            background .25s ease,
            color .25s ease;
        }

        .premium-demo[data-theme="black-gold"] {
          --demo-bg: #060503;
          --demo-surface: rgba(17,13,7,.95);
          --demo-panel: rgba(214,180,94,.05);
          --demo-accent: #d6b45e;
          --demo-text: #fffaf0;
          --demo-muted: rgba(255,250,240,.57);
          --demo-border: rgba(214,180,94,.22);
          background:
            radial-gradient(circle at 16% 6%, rgba(214,180,94,.15), transparent 27%),
            var(--demo-bg);
        }

        .premium-demo[data-theme="clean-white"] {
          --demo-bg: #f2f6f8;
          --demo-surface: rgba(255,255,255,.97);
          --demo-panel: rgba(22,119,167,.045);
          --demo-accent: #1677a7;
          --demo-text: #0c1720;
          --demo-muted: rgba(12,23,32,.58);
          --demo-border: rgba(12,23,32,.12);
          background:
            radial-gradient(circle at 18% 6%, rgba(22,119,167,.10), transparent 26%),
            var(--demo-bg);
        }

        .premium-demo * {
          box-sizing: border-box;
        }

        .demo-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px max(18px,4vw);
          background: color-mix(in srgb, var(--demo-bg) 88%, transparent);
          border-bottom: 1px solid var(--demo-border);
          backdrop-filter: blur(16px);
        }

        .demo-brand {
          text-align: center;
        }

        .demo-brand strong {
          display: block;
          color: var(--demo-text);
          font-size: 13px;
          letter-spacing: .08em;
        }

        .demo-brand small {
          display: block;
          margin-top: 3px;
          color: var(--demo-accent);
          font-size: 8px;
          letter-spacing: .16em;
        }

        .demo-nav-secondary,
        .demo-secondary-button {
          border: 1px solid var(--demo-border);
          background: transparent;
          color: var(--demo-text);
          cursor: pointer;
        }

        .demo-nav-secondary {
          padding: 9px 12px;
          font-size: 10px;
        }

        .demo-primary-button {
          border: 0;
          padding: 13px 18px;
          background: var(--demo-accent);
          color: #061018;
          font-weight: 800;
          cursor: pointer;
        }

        .premium-demo[data-theme="clean-white"] .demo-primary-button {
          color: #fff;
        }

        .demo-nav-cta {
          padding: 10px 13px;
          font-size: 10px;
        }

        .demo-secondary-button {
          padding: 13px 18px;
        }

        .demo-section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }

        .demo-hero {
          padding-top: 72px;
        }

        .demo-hero-grid {
          display: grid;
          grid-template-columns:
            minmax(0,1.25fr)
            minmax(280px,.75fr);
          gap: 34px;
          align-items: center;
        }

        .demo-eyebrow {
          color: var(--demo-accent);
          font-size: 9px;
          letter-spacing: .16em;
        }

        .demo-hero h1 {
          margin: 12px 0 14px;
          max-width: 760px;
          color: var(--demo-text);
          font-size: clamp(42px,7vw,88px);
          line-height: .94;
          font-weight: 500;
        }

        .demo-hero h1 em {
          color: var(--demo-accent);
          font-style: normal;
        }

        .demo-lead {
          max-width: 680px;
          margin: 0;
          color: var(--demo-muted);
          line-height: 2;
          font-size: 13px;
        }

        .demo-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .demo-panel,
        .demo-doctor-card {
          background: var(--demo-surface);
          border: 1px solid var(--demo-border);
        }

        .demo-doctor-card {
          padding: 20px;
        }

        .demo-doctor-photo {
          width: 80px;
          height: 80px;
          flex: 0 0 80px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          background:
            radial-gradient(circle at 50% 25%, var(--demo-panel), transparent 54%),
            linear-gradient(145deg,var(--demo-panel),transparent);
          border: 1px solid var(--demo-border);
        }

        .demo-doctor-photo span {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--demo-accent);
          background: var(--demo-panel);
          border: 1px solid var(--demo-border);
          font-size: 38px;
          font-weight: 800;
        }

        .demo-doctor-card h2 {
          margin: 7px 0 4px;
          color: var(--demo-text);
          font-size: 28px;
        }

        .demo-doctor-card p,
        .demo-panel p {
          color: var(--demo-muted);
          line-height: 1.8;
          font-size: 11px;
        }

        .demo-mini-badges,
        .demo-socials {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .demo-mini-badges span,
        .demo-socials span {
          padding: 7px 9px;
          border: 1px solid var(--demo-border);
          color: var(--demo-text);
          font-size: 9px;
        }

        .demo-panel {
          padding: 22px;
        }

        .demo-section-title {
          margin: 7px 0 16px;
          color: var(--demo-text);
          font-size: 30px;
        }

        .demo-big-title {
          margin: 8px 0 18px;
          color: var(--demo-text);
          font-size: clamp(34px,5vw,60px);
        }

        .demo-theme-grid,
        .demo-info-grid,
        .demo-reviews-scroller,
        .demo-cases-scroller {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 12px;
        }

        .demo-theme-card {
          min-height: 82px;
          padding: 14px;
          text-align: right;
          cursor: pointer;
          border: 1px solid var(--demo-border);
        }

        .demo-theme-card strong,
        .demo-theme-card small {
          display: block;
        }

        .demo-theme-card small {
          margin-top: 6px;
          opacity: .6;
        }

        .theme-card-dark-blue {
          color: #fff;
          background: linear-gradient(135deg,#071522,#02070e);
        }

        .theme-card-black-gold {
          color: #fff;
          background: linear-gradient(135deg,#17120a,#030303);
        }

        .theme-card-clean-white {
          color: #0c1720;
          background: linear-gradient(135deg,#fff,#e9eef3);
        }

        .demo-theme-selected {
          border: 2px solid var(--demo-accent);
          box-shadow: 0 0 0 3px color-mix(in srgb,var(--demo-accent) 20%,transparent);
          transform: translateY(-2px);
        }

        .demo-info-grid .demo-panel h3 {
          margin: 8px 0 6px;
          color: var(--demo-text);
        }

        .demo-services-scroller {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .demo-service-card {
          min-width: 170px;
          padding: 14px 16px;
          background: var(--demo-surface);
          border: 1px solid var(--demo-border);
          color: var(--demo-text);
        }

        .demo-service-card > span {
          color: var(--demo-accent);
          margin-left: 7px;
        }

        .demo-case-card {
          overflow: hidden;
          background: var(--demo-surface);
          border: 1px solid var(--demo-border);
        }

        .demo-slider {
          position: relative;
          height: 320px;
          overflow: hidden;
          background: linear-gradient(145deg,var(--demo-panel),var(--demo-surface));
        }

        .demo-after,
        .demo-before {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          text-align: center;
        }

        .demo-after {
          background:
            radial-gradient(circle at 68% 35%,rgba(255,255,255,.13),transparent 22%),
            linear-gradient(145deg,var(--demo-panel),rgba(255,255,255,.015));
        }

        .demo-before {
          opacity: .74;
          background:
            radial-gradient(circle at 35% 48%,rgba(255,255,255,.08),transparent 20%),
            linear-gradient(145deg,rgba(170,180,190,.13),rgba(0,0,0,.08));
        }

        .demo-after strong {
          color: var(--demo-accent);
          font-size: 10px;
          letter-spacing: .18em;
        }

        .demo-before strong {
          color: var(--demo-muted);
          font-size: 10px;
          letter-spacing: .18em;
        }

        .demo-tooth {
          font-size: 72px;
          filter: drop-shadow(0 12px 26px rgba(0,0,0,.18));
        }

        .demo-tooth-before {
          font-size: 64px;
        }

        .demo-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          transform: translateX(-1px);
          background: #fff;
          box-shadow: 0 0 16px rgba(0,0,0,.35);
          pointer-events: none;
        }

        .demo-divider span {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 42px;
          height: 42px;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #fff;
          color: #111;
          font-weight: 900;
        }

        .demo-slider input[type="range"] {
          position: absolute;
          inset: 0;
          z-index: 3;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
          cursor: ew-resize;
        }

        .demo-case-content {
          padding: 18px;
        }

        .demo-case-content > span {
          color: var(--demo-accent);
          font-size: 9px;
          letter-spacing: .14em;
        }

        .demo-case-content h3 {
          margin: 8px 0 6px;
          color: var(--demo-text);
          font-size: 18px;
        }

        .demo-case-content p {
          margin: 0;
          color: var(--demo-muted);
          font-size: 11px;
          line-height: 1.8;
        }

        .demo-footnote {
          margin: 14px 0 0;
          color: var(--demo-muted);
          font-size: 9px;
          line-height: 1.8;
        }

        .demo-reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .demo-rating-box {
          padding: 10px 13px;
          border: 1px solid var(--demo-border);
        }

        .demo-rating-box strong {
          display: block;
          color: var(--demo-text);
          font-size: 24px;
        }

        .demo-rating-box span,
        .demo-stars {
          color: #f2ca64;
        }

        .demo-review-card {
          min-height: 160px;
          padding: 18px;
          background: var(--demo-panel);
          border: 1px solid var(--demo-border);
        }

        .demo-review-card p {
          color: var(--demo-muted);
          line-height: 1.9;
          font-size: 11px;
        }

        .demo-review-card strong {
          color: var(--demo-text);
          font-size: 11px;
        }

        .demo-stars span {
          opacity: .18;
        }

        .demo-premium-tools {
          display: grid;
          grid-template-columns:
            minmax(0,1fr) 230px;
          gap: 18px;
          align-items: center;
          padding: 24px;
          background: var(--demo-surface);
          border: 1px solid var(--demo-border);
        }

        .demo-stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 10px;
        }

        .demo-stat-card {
          padding: 13px;
          background: var(--demo-panel);
          border: 1px solid var(--demo-border);
        }

        .demo-stat-card strong {
          display: block;
          color: var(--demo-text);
          font-size: 22px;
        }

        .demo-stat-card small {
          color: var(--demo-muted);
          font-size: 8px;
        }

        .demo-qr {
          padding: 14px;
          background: #fff;
        }

        .demo-final-section {
          padding-bottom: 80px;
        }

        .demo-final-cta {
          padding: 36px 24px;
          text-align: center;
          background: linear-gradient(135deg,var(--demo-panel),var(--demo-surface));
          border: 1px solid var(--demo-border);
        }

        .demo-final-cta h2 {
          max-width: 700px;
          margin: 10px auto 12px;
          color: var(--demo-text);
          font-size: clamp(30px,5vw,54px);
          line-height: 1.12;
        }

        .demo-final-cta p {
          max-width: 650px;
          margin: 0 auto 20px;
          color: var(--demo-muted);
          line-height: 1.9;
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .demo-hero-grid,
          .demo-premium-tools {
            grid-template-columns:
              1fr !important;
          }

          .demo-theme-grid,
          .demo-info-grid {
            grid-template-columns:
              1fr !important;
          }

          .demo-stats-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr)) !important;
          }

          .demo-services-scroller,
          .demo-cases-scroller,
          .demo-reviews-scroller {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 84vw !important;
            grid-template-columns: none !important;
            gap: 12px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 10px;
          }

          .demo-services-scroller::-webkit-scrollbar,
          .demo-cases-scroller::-webkit-scrollbar,
          .demo-reviews-scroller::-webkit-scrollbar {
            display: none;
          }

          .demo-service-card,
          .demo-case-card,
          .demo-review-card {
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
        }

        @media (max-width: 520px) {
          .demo-nav {
            padding: 10px 12px;
          }

          .demo-brand strong {
            font-size: 10px;
          }

          .demo-nav-cta {
            padding: 9px 10px;
            font-size: 9px;
          }

          .demo-nav-secondary {
            padding: 8px 9px;
            font-size: 9px;
          }

          .demo-section {
            padding-left: 14px;
            padding-right: 14px;
          }

          .demo-services-scroller,
          .demo-cases-scroller,
          .demo-reviews-scroller {
            grid-auto-columns: 87vw !important;
          }

          .demo-slider {
            height: 300px;
          }
        }
      `}</style>
    </main>
  );
}