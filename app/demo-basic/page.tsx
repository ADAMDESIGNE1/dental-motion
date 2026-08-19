"use client";

import {
  useState,
} from "react";
import { useRouter } from "next/navigation";

type DemoCase = {
  title: string;
  description: string;
};

const demoCases: DemoCase[] = [
  {
    title: "Basic Case 01",
    description:
      "مثال على أول حالة Before / After ضمن الباقة العادية.",
  },
  {
    title: "Basic Case 02",
    description:
      "مثال على ثاني حالة Before / After ضمن الحد المتاح للباقة العادية.",
  },
];

function BeforeAfterDemo({
  item,
}: {
  item: DemoCase;
}) {
  const [position, setPosition] =
    useState(50);

  return (
    <article className="basic-case-card">
      <div className="basic-slider">
        <div className="basic-after">
          <div>
            <div className="basic-tooth">
              🦷
            </div>
            <strong>AFTER</strong>
          </div>
        </div>

        <div
          className="basic-before"
          style={{
            clipPath: `inset(0 ${
              100 - position
            }% 0 0)`,
          }}
        >
          <div>
            <div className="basic-tooth basic-tooth-before">
              🦷
            </div>
            <strong>BEFORE</strong>
          </div>
        </div>

        <div
          className="basic-divider"
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

      <div className="basic-case-content">
        <span>BEFORE / AFTER</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}

export default function BasicDemoPage() {
  const router = useRouter();

  function subscribeBasic() {
    router.push(
      "/subscription?plan=basic"
    );
  }

  return (
    <main
      className="basic-demo"
      dir="rtl"
    >
      <header className="basic-nav">
        <button
          type="button"
          className="basic-secondary"
          onClick={() =>
            router.push("/")
          }
        >
          ← الرئيسية
        </button>

        <div className="basic-brand">
          <strong>
            BASIC DEMO
          </strong>
          <small>ADAM DESIGN</small>
        </div>

        <button
          type="button"
          className="basic-primary basic-nav-cta"
          onClick={subscribeBasic}
        >
          اشترك بالعادي
        </button>
      </header>

      <section className="basic-section basic-hero">
        <div className="basic-hero-grid">
          <div>
            <span className="basic-eyebrow">
              نموذج توضيحي للباقة العادية
            </span>

            <h1>
              صفحة طبيب
              <br />
              <em>
                بسيطة ومرتبة.
              </em>
            </h1>

            <p className="basic-lead">
              هذا نموذج غير حقيقي يوضح شكل الباقة العادية:
              معلومات الطبيب، الصورة الشخصية، الاختصاص، النبذة،
              معلومات التواصل، موقع العيادة وأوقات الدوام،
              وروابط السوشيال مع حالتين Before / After.
            </p>

            <div className="basic-actions">
              <button
                type="button"
                className="basic-primary"
                onClick={subscribeBasic}
              >
                أريد موقع مثل هذا
              </button>

              <button
                type="button"
                className="basic-secondary"
                onClick={() =>
                  document
                    .getElementById(
                      "basic-cases"
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

          <div className="basic-doctor-card">
            <div className="basic-doctor-photo">
              <span>DR</span>
            </div>

            <span className="basic-eyebrow">
              GENERAL DENTISTRY
            </span>

            <h2>
              د. أحمد — BASIC DEMO
            </h2>

            <p>
              صفحة تجريبية وليست ملف طبيب حقيقي
            </p>

            <div className="basic-mini-badges">
              <span>Basic</span>
              <span>Baghdad</span>
              <span>General Dentist</span>
            </div>
          </div>
        </div>
      </section>

      <section className="basic-section">
        <div className="basic-info-grid">
          <div className="basic-panel">
            <span className="basic-eyebrow">
              ABOUT
            </span>

            <h3>
              نبذة عن الطبيب
            </h3>

            <p>
              نبذة مهنية قصيرة توضح اختصاص الطبيب وخبرته وطبيعة الخدمات
              التي يقدمها للمرضى.
            </p>
          </div>

          <div className="basic-panel">
            <span className="basic-eyebrow">
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

          <div className="basic-panel">
            <span className="basic-eyebrow">
              LOCATION
            </span>

            <h3>
              📍 موقع العيادة
            </h3>

            <p>
              زر مباشر يفتح Google Maps للمريض.
            </p>
          </div>
        </div>
      </section>

      <section className="basic-section">
        <div className="basic-panel">
          <span className="basic-eyebrow">
            CONTACT & SOCIAL
          </span>

          <h2 className="basic-section-title">
            تواصل ويا الطبيب
          </h2>

          <div className="basic-contact-grid">
            <div>
              <strong>
                WhatsApp
              </strong>
              <span>
                زر تواصل مباشر
              </span>
            </div>

            <div>
              <strong>
                Instagram
              </strong>
              <span>
                رابط حساب الطبيب
              </span>
            </div>

            <div>
              <strong>
                TikTok
              </strong>
              <span>
                رابط حساب الطبيب
              </span>
            </div>

            <div>
              <strong>
                Facebook
              </strong>
              <span>
                رابط صفحة الطبيب
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="basic-cases"
        className="basic-section"
      >
        <span className="basic-eyebrow">
          SELECTED WORK
        </span>

        <h2 className="basic-big-title">
          حالتان Before / After
        </h2>

        <p className="basic-lead basic-small-lead">
          الباقة العادية تسمح بعرض حالتين منشورتين.
        </p>

        <div className="basic-cases-scroller">
          {demoCases.map(
            (item) => (
              <BeforeAfterDemo
                key={item.title}
                item={item}
              />
            )
          )}
        </div>

        <p className="basic-footnote">
          * العناصر هنا توضيحية فقط وليست حالات طبية حقيقية.
        </p>
      </section>

      <section className="basic-section basic-limit-section">
        <div className="basic-limit-card">
          <span className="basic-eyebrow">
            BASIC PLAN
          </span>

          <h2>
            شنو يشمل الاشتراك العادي؟
          </h2>

          <div className="basic-features-grid">
            {[
              "صفحة خاصة باسم الطبيب",
              "الصورة الشخصية",
              "الاختصاص والخبرة",
              "نبذة مهنية",
              "معلومات التواصل",
              "Google Maps وأوقات الدوام",
              "روابط السوشيال",
              "حالتان Before / After",
            ].map((feature) => (
              <div
                key={feature}
              >
                <span>✓</span>
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="basic-section basic-final-section">
        <div className="basic-final-cta">
          <span className="basic-eyebrow">
            BASIC • 25,000 IQD
          </span>

          <h2>
            تريد بداية بسيطة ومرتبة؟
          </h2>

          <p>
            الباقة العادية مناسبة للطبيب اللي يريد صفحة واضحة باسمه
            ومعلوماته وحالتين Before / After بدون إضافات الـPremium.
          </p>

          <button
            type="button"
            className="basic-primary"
            onClick={subscribeBasic}
          >
            اشترك بالباقة العادية ↗
          </button>
        </div>
      </section>

      <style jsx global>{`
        .basic-demo {
          --basic-bg: #02070e;
          --basic-surface: rgba(4,14,25,.95);
          --basic-panel: rgba(50,186,255,.045);
          --basic-accent: #32baff;
          --basic-text: #ffffff;
          --basic-muted: rgba(255,255,255,.56);
          --basic-border: rgba(50,186,255,.18);
          min-height: 100vh;
          background:
            radial-gradient(circle at 18% 7%, rgba(50,186,255,.12), transparent 27%),
            var(--basic-bg);
          color: var(--basic-text);
        }

        .basic-demo * {
          box-sizing: border-box;
        }

        .basic-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px max(18px,4vw);
          background: rgba(2,7,14,.88);
          border-bottom: 1px solid var(--basic-border);
          backdrop-filter: blur(16px);
        }

        .basic-brand {
          text-align: center;
        }

        .basic-brand strong {
          display: block;
          color: var(--basic-text);
          font-size: 13px;
          letter-spacing: .08em;
        }

        .basic-brand small {
          display: block;
          margin-top: 3px;
          color: var(--basic-accent);
          font-size: 8px;
          letter-spacing: .16em;
        }

        .basic-primary {
          border: 0;
          padding: 13px 18px;
          background: var(--basic-accent);
          color: #061018;
          font-weight: 800;
          cursor: pointer;
        }

        .basic-secondary {
          border: 1px solid var(--basic-border);
          padding: 13px 18px;
          background: transparent;
          color: var(--basic-text);
          cursor: pointer;
        }

        .basic-nav-cta {
          padding: 10px 13px;
          font-size: 10px;
        }

        .basic-nav > .basic-secondary {
          padding: 9px 12px;
          font-size: 10px;
        }

        .basic-section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }

        .basic-hero {
          padding-top: 72px;
        }

        .basic-hero-grid {
          display: grid;
          grid-template-columns:
            minmax(0,1.25fr)
            minmax(280px,.75fr);
          gap: 34px;
          align-items: center;
        }

        .basic-eyebrow {
          color: var(--basic-accent);
          font-size: 9px;
          letter-spacing: .16em;
        }

        .basic-hero h1 {
          margin: 12px 0 14px;
          max-width: 760px;
          color: var(--basic-text);
          font-size: clamp(42px,7vw,88px);
          line-height: .94;
          font-weight: 500;
        }

        .basic-hero h1 em {
          color: var(--basic-accent);
          font-style: normal;
        }

        .basic-lead {
          max-width: 680px;
          margin: 0;
          color: var(--basic-muted);
          line-height: 2;
          font-size: 13px;
        }

        .basic-small-lead {
          margin-bottom: 18px;
        }

        .basic-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .basic-doctor-card,
        .basic-panel,
        .basic-limit-card {
          background: var(--basic-surface);
          border: 1px solid var(--basic-border);
        }

        .basic-doctor-card {
          padding: 20px;
        }

        .basic-doctor-photo {
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          background:
            radial-gradient(circle at 50% 25%, var(--basic-panel), transparent 54%),
            linear-gradient(145deg,var(--basic-panel),transparent);
          border: 1px solid var(--basic-border);
        }

        .basic-doctor-photo span {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--basic-accent);
          background: var(--basic-panel);
          border: 1px solid var(--basic-border);
          font-size: 38px;
          font-weight: 800;
        }

        .basic-doctor-card h2 {
          margin: 7px 0 4px;
          color: var(--basic-text);
          font-size: 28px;
        }

        .basic-doctor-card p,
        .basic-panel p {
          color: var(--basic-muted);
          line-height: 1.8;
          font-size: 11px;
        }

        .basic-mini-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .basic-mini-badges span {
          padding: 7px 9px;
          border: 1px solid var(--basic-border);
          color: var(--basic-text);
          font-size: 9px;
        }

        .basic-panel,
        .basic-limit-card {
          padding: 22px;
        }

        .basic-info-grid {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 12px;
        }

        .basic-panel h3 {
          margin: 8px 0 6px;
          color: var(--basic-text);
        }

        .basic-section-title {
          margin: 7px 0 16px;
          color: var(--basic-text);
          font-size: 30px;
        }

        .basic-big-title {
          margin: 8px 0 8px;
          color: var(--basic-text);
          font-size: clamp(34px,5vw,60px);
        }

        .basic-contact-grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 10px;
        }

        .basic-contact-grid > div {
          padding: 14px;
          background: var(--basic-panel);
          border: 1px solid var(--basic-border);
        }

        .basic-contact-grid strong,
        .basic-contact-grid span {
          display: block;
        }

        .basic-contact-grid strong {
          color: var(--basic-text);
          font-size: 11px;
        }

        .basic-contact-grid span {
          margin-top: 5px;
          color: var(--basic-muted);
          font-size: 9px;
        }

        .basic-cases-scroller {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,420px));
          justify-content: center;
          gap: 16px;
        }

        .basic-case-card {
          overflow: hidden;
          background: var(--basic-surface);
          border: 1px solid var(--basic-border);
        }

        .basic-slider {
          position: relative;
          height: 320px;
          overflow: hidden;
          background: linear-gradient(145deg,var(--basic-panel),var(--basic-surface));
        }

        .basic-after,
        .basic-before {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          text-align: center;
        }

        .basic-after {
          background:
            radial-gradient(circle at 68% 35%,rgba(255,255,255,.13),transparent 22%),
            linear-gradient(145deg,var(--basic-panel),rgba(255,255,255,.015));
        }

        .basic-before {
          opacity: .74;
          background:
            radial-gradient(circle at 35% 48%,rgba(255,255,255,.08),transparent 20%),
            linear-gradient(145deg,rgba(170,180,190,.13),rgba(0,0,0,.08));
        }

        .basic-after strong {
          color: var(--basic-accent);
          font-size: 10px;
          letter-spacing: .18em;
        }

        .basic-before strong {
          color: var(--basic-muted);
          font-size: 10px;
          letter-spacing: .18em;
        }

        .basic-tooth {
          font-size: 72px;
          filter: drop-shadow(0 12px 26px rgba(0,0,0,.18));
        }

        .basic-tooth-before {
          font-size: 64px;
        }

        .basic-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          transform: translateX(-1px);
          background: #fff;
          box-shadow: 0 0 16px rgba(0,0,0,.35);
          pointer-events: none;
        }

        .basic-divider span {
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

        .basic-slider input[type="range"] {
          position: absolute;
          inset: 0;
          z-index: 3;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
          cursor: ew-resize;
        }

        .basic-case-content {
          padding: 18px;
        }

        .basic-case-content > span {
          color: var(--basic-accent);
          font-size: 9px;
          letter-spacing: .14em;
        }

        .basic-case-content h3 {
          margin: 8px 0 6px;
          color: var(--basic-text);
          font-size: 18px;
        }

        .basic-case-content p {
          margin: 0;
          color: var(--basic-muted);
          font-size: 11px;
          line-height: 1.8;
        }

        .basic-footnote {
          margin: 14px 0 0;
          color: var(--basic-muted);
          font-size: 9px;
          line-height: 1.8;
        }

        .basic-features-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 10px;
          margin-top: 16px;
        }

        .basic-features-grid > div {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          padding: 12px 13px;
          background: var(--basic-panel);
          border: 1px solid var(--basic-border);
        }

        .basic-features-grid span {
          color: var(--basic-accent);
        }

        .basic-features-grid p {
          margin: 0;
          color: var(--basic-muted);
          font-size: 10px;
          line-height: 1.7;
        }

        .basic-final-section {
          padding-bottom: 80px;
        }

        .basic-final-cta {
          padding: 36px 24px;
          text-align: center;
          background: linear-gradient(135deg,var(--basic-panel),var(--basic-surface));
          border: 1px solid var(--basic-border);
        }

        .basic-final-cta h2 {
          max-width: 700px;
          margin: 10px auto 12px;
          color: var(--basic-text);
          font-size: clamp(30px,5vw,54px);
          line-height: 1.12;
        }

        .basic-final-cta p {
          max-width: 650px;
          margin: 0 auto 20px;
          color: var(--basic-muted);
          line-height: 1.9;
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .basic-hero-grid,
          .basic-info-grid {
            grid-template-columns:
              1fr !important;
          }

          .basic-contact-grid,
          .basic-features-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr)) !important;
          }

          .basic-cases-scroller {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 84vw !important;
            grid-template-columns: none !important;
            justify-content: start !important;
            gap: 12px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 10px;
          }

          .basic-cases-scroller::-webkit-scrollbar {
            display: none;
          }

          .basic-case-card {
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
        }

        @media (max-width: 520px) {
          .basic-nav {
            padding: 10px 12px;
          }

          .basic-brand strong {
            font-size: 10px;
          }

          .basic-nav-cta {
            padding: 9px 10px;
            font-size: 9px;
          }

          .basic-nav > .basic-secondary {
            padding: 8px 9px;
            font-size: 9px;
          }

          .basic-section {
            padding-left: 14px;
            padding-right: 14px;
          }

          .basic-contact-grid,
          .basic-features-grid {
            grid-template-columns:
              1fr !important;
          }

          .basic-cases-scroller {
            grid-auto-columns: 87vw !important;
          }

          .basic-slider {
            height: 300px;
          }
        }
      `}</style>
    </main>
  );
}