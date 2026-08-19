"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionDetailsPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("annual");

  const plans = {
    monthly: {
      name: "الباقة الشهرية",
      price: "25,000",
      period: "شهرياً",
    },
    annual: {
      name: "الباقة السنوية",
      price: "200,000",
      period: "سنوياً",
    },
  };

  const currentPlan =
    plans[selectedPlan as keyof typeof plans];

  return (
    <main dir="rtl" style={pageStyle}>
      <div style={backgroundGlow} />

      <div style={containerStyle}>
        {/* HEADER */}
        <header style={headerStyle}>
          <button
            onClick={() => router.back()}
            style={backButton}
          >
            ← رجوع
          </button>

          <div style={brand}>
            <span style={brandSmall}>ADAM</span>
            <span style={brandLarge}>DESIGN</span>
          </div>
        </header>

        {/* HERO */}
        <section style={hero}>
          <div style={goldLabel}>
            ADAM DESIGN • DOCTOR PROFILE
          </div>

          <h1 style={heroTitle}>
            خلّي اسمك الطبي
            <br />
            <span style={goldText}>يظهر بالشكل الذي يليق بك</span>
          </h1>

          <p style={heroText}>
            وجودك الرقمي مو مجرد صفحة على الإنترنت.
            <br />
            هو أول انطباع يأخذه المريض عنك وعن خبرتك
            وشغلك.
          </p>

          <p style={heroSubText}>
            مع ADAM DESIGN تحصل على مساحة احترافية
            تعرض فيها خبرتك، شهاداتك، خدماتك وحالات
            قبل وبعد بطريقة مرتبة وأنيقة.
          </p>
        </section>

        {/* WHY */}
        <section style={section}>
          <div style={sectionLabel}>WHY ADAM DESIGN</div>

          <h2 style={sectionTitle}>
            لماذا يحتاج الطبيب إلى ملف احترافي؟
          </h2>

          <div style={benefitsGrid}>
            <Benefit
              number="01"
              title="خلّي المريض يعرفك"
              text="اسمك، اختصاصك، خبرتك وخدماتك تكون واضحة أمام المريض بمكان واحد."
            />

            <Benefit
              number="02"
              title="اعرض شغلك الحقيقي"
              text="أضف حالاتك قبل وبعد حتى يشوف المريض النتائج والأعمال التي أنجزتها."
            />

            <Benefit
              number="03"
              title="شهاداتك بمكان واحد"
              text="اعرض شهاداتك ومؤهلاتك المهنية بطريقة منظمة تعطي صورة أقوى عن خبرتك."
            />

            <Benefit
              number="04"
              title="وجودك يستمر"
              text="بدل ما يعتمد المريض على منشور أو ستوري، يكون عندك ملف يمكن الرجوع إليه."
            />
          </div>
        </section>

        {/* PLAN */}
        <section style={section}>
          <div style={sectionLabel}>CHOOSE YOUR PLAN</div>

          <h2 style={sectionTitle}>
            اختر الباقة المناسبة لك
          </h2>

          <div style={plansGrid}>
            <PlanCard
              active={selectedPlan === "monthly"}
              onClick={() => setSelectedPlan("monthly")}
              title="شهري"
              price="25,000"
              period="دينار عراقي / شهر"
              description="للطبيب الذي يريد البدء وتجربة المنصة."
            />

            <PlanCard
              active={selectedPlan === "annual"}
              onClick={() => setSelectedPlan("annual")}
              title="سنوي"
              price="200,000"
              period="دينار عراقي / سنة"
              description="الخيار الأفضل للطبيب الذي يريد حضوراً مستمراً."
              recommended
            />
          </div>
        </section>

        {/* INCLUDED */}
        <section style={section}>
          <div style={sectionLabel}>WHAT YOU GET</div>

          <h2 style={sectionTitle}>
            ماذا تحصل بعد الاشتراك؟
          </h2>

          <div style={features}>
            <Feature text="ملف طبيب احترافي باسمك" />
            <Feature text="عرض الاختصاص والخبرة والنبذة" />
            <Feature text="إضافة الصورة الشخصية" />
            <Feature text="إضافة الشهادات والمؤهلات" />
            <Feature text="إضافة الخدمات التي تقدمها" />
            <Feature text="إضافة حالات قبل وبعد" />
            <Feature text="إمكانية تعديل معلوماتك من لوحة الطبيب" />
            <Feature text="إمكانية إضافة أكثر من حالة" />
            <Feature text="صفحة خاصة بك يمكن مشاركتها مع المرضى" />
          </div>
        </section>

        {/* SELECTED PLAN */}
        <section style={checkoutSection}>
          <div style={checkoutTop}>
            <div>
              <div style={sectionLabel}>
                YOUR SELECTED PLAN
              </div>

              <h2 style={checkoutTitle}>
                {currentPlan.name}
              </h2>

              <p style={checkoutText}>
                {selectedPlan === "annual"
                  ? "أفضل قيمة للطبيب الذي يريد بناء حضور مهني مستمر."
                  : "ابدأ بخطوة بسيطة وعرّف المرضى بخبرتك."
                }
              </p>
            </div>

            <div style={priceBox}>
              <strong style={price}>
                {currentPlan.price}
              </strong>

              <span style={pricePeriod}>
                {currentPlan.period}
              </span>

              <small style={currency}>
                دينار عراقي
              </small>
            </div>
          </div>

          <div style={divider} />

          <div style={checkoutList}>
            <div>
              <span>الباقة</span>
              <strong>{currentPlan.name}</strong>
            </div>

            <div>
              <span>السعر</span>
              <strong>
                {currentPlan.price} د.ع
              </strong>
            </div>

            <div>
              <span>الحساب</span>
              <strong>حساب طبيب</strong>
            </div>
          </div>

          <button
            onClick={() =>
              router.push(
                `/subscription?plan=${selectedPlan}`
              )
            }
            style={subscribeButton}
          >
            متابعة الاشتراك
            <span>←</span>
          </button>

          <p style={secureText}>
            بعد المتابعة ستنتقل إلى خطوات إكمال الاشتراك.
          </p>
        </section>

        {/* FINAL MESSAGE */}
        <section style={finalSection}>
          <div style={goldLabel}>
            YOUR NAME. YOUR WORK. YOUR PROFILE.
          </div>

          <h2 style={finalTitle}>
            لأن شغلك يستحق
            <br />
            أن يُعرض بطريقة تليق به.
          </h2>

          <p style={finalText}>
            ADAM DESIGN يساعدك على تحويل خبرتك
            وأعمالك إلى حضور رقمي مرتب واحترافي
            يمكن للمريض الرجوع إليه في أي وقت.
          </p>

          <button
            onClick={() => router.push("/subscription")}
            style={outlineButton}
          >
            العودة إلى الاشتراك
          </button>
        </section>

        <footer style={footer}>
          <span>ADAM DESIGN</span>
          <span>© 2026</span>
        </footer>
      </div>
    </main>
  );
}

/* =========================
   COMPONENTS
========================= */

function Benefit({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={benefitCard}>
      <div style={benefitNumber}>{number}</div>

      <h3 style={benefitTitle}>
        {title}
      </h3>

      <p style={benefitText}>
        {text}
      </p>
    </div>
  );
}

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div style={feature}>
      <span style={check}>✓</span>

      <span>{text}</span>
    </div>
  );
}

function PlanCard({
  active,
  onClick,
  title,
  price,
  period,
  description,
  recommended,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  period: string;
  description: string;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...planCard,
        ...(active ? activePlan : {}),
      }}
    >
      {recommended && (
        <div style={recommendedBadge}>
          الأكثر اختياراً
        </div>
      )}

      <div style={planRadio}>
        <div
          style={{
            ...radioCircle,
            ...(active ? radioActive : {}),
          }}
        />
      </div>

      <div style={planName}>
        {title}
      </div>

      <div style={planPrice}>
        {price}
        <span style={planCurrency}>
          د.ع
        </span>
      </div>

      <div style={planPeriod}>
        {period}
      </div>

      <p style={planDescription}>
        {description}
      </p>
    </button>
  );
}

/* =========================
   STYLES
========================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 0%, rgba(0,140,255,.14), transparent 35%), #020409",
  color: "#fff",
  padding: "0 18px 70px",
  fontFamily:
    "Arial, Tahoma, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const backgroundGlow: React.CSSProperties = {
  position: "fixed",
  width: 500,
  height: 500,
  borderRadius: "50%",
  background:
    "rgba(0,140,255,.05)",
  filter: "blur(100px)",
  top: 100,
  left: "50%",
  transform: "translateX(-50%)",
  pointerEvents: "none",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1050,
  margin: "0 auto",
  position: "relative",
};

const headerStyle: React.CSSProperties = {
  minHeight: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const brand: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  lineHeight: 1,
  textAlign: "right",
};

const brandSmall: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 10,
  letterSpacing: ".35em",
};

const brandLarge: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 22,
  letterSpacing: ".08em",
  marginTop: 6,
};

const backButton: React.CSSProperties = {
  background: "transparent",
  border:
    "1px solid rgba(255,255,255,.12)",
  color: "rgba(255,255,255,.7)",
  padding: "10px 18px",
  cursor: "pointer",
};

const hero: React.CSSProperties = {
  textAlign: "center",
  padding: "85px 15px 75px",
};

const goldLabel: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 10,
  letterSpacing: ".2em",
  lineHeight: 1.8,
};

const heroTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: "clamp(36px, 6vw, 68px)",
  lineHeight: 1.25,
  margin: "25px 0",
};

const goldText: React.CSSProperties = {
  color: "#c7a85d",
};

const heroText: React.CSSProperties = {
  maxWidth: 700,
  margin: "0 auto",
  color: "rgba(255,255,255,.75)",
  fontSize: 17,
  lineHeight: 2,
};

const heroSubText: React.CSSProperties = {
  maxWidth: 650,
  margin: "20px auto 0",
  color: "rgba(255,255,255,.42)",
  fontSize: 13,
  lineHeight: 2,
};

const section: React.CSSProperties = {
  marginBottom: 25,
  padding: "40px",
  background:
    "rgba(3,8,18,.82)",
  border:
    "1px solid rgba(0,140,255,.15)",
};

const sectionLabel: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 9,
  letterSpacing: ".2em",
  marginBottom: 10,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: "clamp(25px, 4vw, 38px)",
  margin: "0 0 30px",
};

const benefitsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
};

const benefitCard: React.CSSProperties = {
  padding: 25,
  background:
    "rgba(0,0,0,.22)",
  border:
    "1px solid rgba(255,255,255,.07)",
  minHeight: 190,
};

const benefitNumber: React.CSSProperties = {
  color: "#32baff",
  fontSize: 11,
  letterSpacing: ".15em",
  marginBottom: 30,
};

const benefitTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 20,
  fontWeight: 400,
  margin: "0 0 12px",
};

const benefitText: React.CSSProperties = {
  color: "rgba(255,255,255,.45)",
  fontSize: 12,
  lineHeight: 1.9,
  margin: 0,
};

const plansGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(260px,1fr))",
  gap: 20,
};

const planCard: React.CSSProperties = {
  position: "relative",
  textAlign: "right",
  padding: 30,
  background:
    "rgba(0,0,0,.25)",
  color: "#fff",
  border:
    "1px solid rgba(255,255,255,.1)",
  cursor: "pointer",
  minHeight: 260,
};

const activePlan: React.CSSProperties = {
  border:
    "1px solid rgba(0,140,255,.65)",
  background:
    "linear-gradient(145deg, rgba(0,140,255,.12), rgba(0,0,0,.25))",
};

const recommendedBadge: React.CSSProperties = {
  position: "absolute",
  top: 15,
  left: 15,
  color: "#020409",
  background: "#c7a85d",
  padding: "6px 10px",
  fontSize: 9,
};

const planRadio: React.CSSProperties = {
  position: "absolute",
  top: 25,
  right: 25,
};

const radioCircle: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  border:
    "1px solid rgba(255,255,255,.3)",
};

const radioActive: React.CSSProperties = {
  background: "#008cff",
  borderColor: "#008cff",
  boxShadow:
    "0 0 0 4px rgba(0,140,255,.15)",
};

const planName: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 12,
  marginBottom: 20,
};

const planPrice: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 40,
  fontWeight: 400,
};

const planCurrency: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: 12,
  marginRight: 7,
  color:
    "rgba(255,255,255,.5)",
};

const planPeriod: React.CSSProperties = {
  color: "#32baff",
  fontSize: 11,
  marginTop: 5,
};

const planDescription: React.CSSProperties = {
  color: "rgba(255,255,255,.42)",
  fontSize: 11,
  lineHeight: 1.8,
  marginTop: 25,
};

const features: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: 12,
};

const feature: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "15px 16px",
  background:
    "rgba(0,0,0,.2)",
  border:
    "1px solid rgba(255,255,255,.06)",
  color: "rgba(255,255,255,.72)",
  fontSize: 12,
};

const check: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  flexShrink: 0,
  borderRadius: "50%",
  background:
    "rgba(0,140,255,.12)",
  color: "#32baff",
};

const checkoutSection: React.CSSProperties = {
  padding: 40,
  marginBottom: 25,
  background:
    "linear-gradient(135deg, rgba(0,140,255,.12), rgba(3,8,18,.95))",
  border:
    "1px solid rgba(0,140,255,.35)",
};

const checkoutTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 30,
  flexWrap: "wrap",
};

const checkoutTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 32,
  fontWeight: 400,
  margin: "8px 0",
};

const checkoutText: React.CSSProperties = {
  color: "rgba(255,255,255,.45)",
  fontSize: 12,
  lineHeight: 1.8,
};

const priceBox: React.CSSProperties = {
  minWidth: 180,
  textAlign: "center",
  padding: 25,
  background:
    "rgba(0,0,0,.3)",
  border:
    "1px solid rgba(199,168,93,.2)",
};

const price: React.CSSProperties = {
  display: "block",
  fontFamily: "Georgia, serif",
  fontSize: 38,
  fontWeight: 400,
};

const pricePeriod: React.CSSProperties = {
  display: "block",
  color: "#32baff",
  fontSize: 10,
  marginTop: 5,
};

const currency: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,.4)",
  fontSize: 9,
  marginTop: 8,
};

const divider: React.CSSProperties = {
  height: 1,
  background:
    "rgba(255,255,255,.08)",
  margin: "30px 0",
};

const checkoutList: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginBottom: 25,
};

const checkoutItem = {
  padding: 15,
};

const subscribeButton: React.CSSProperties = {
  width: "100%",
  padding: "17px 25px",
  background: "#008cff",
  color: "#fff",
  border: 0,
  cursor: "pointer",
  fontSize: 14,
  boxShadow:
    "0 10px 30px rgba(0,140,255,.18)",
};

const secureText: React.CSSProperties = {
  textAlign: "center",
  color: "rgba(255,255,255,.3)",
  fontSize: 10,
  margin: "15px 0 0",
};

const finalSection: React.CSSProperties = {
  textAlign: "center",
  padding: "80px 25px",
  borderTop:
    "1px solid rgba(255,255,255,.08)",
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const finalTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: "clamp(30px,5vw,48px)",
  lineHeight: 1.4,
  margin: "20px 0",
};

const finalText: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto 30px",
  color: "rgba(255,255,255,.45)",
  fontSize: 13,
  lineHeight: 2,
};

const outlineButton: React.CSSProperties = {
  padding: "13px 25px",
  background: "transparent",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.35)",
  cursor: "pointer",
};

const footer: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "25px 0",
  color: "rgba(255,255,255,.25)",
  fontSize: 9,
  letterSpacing: ".12em",
};

/* Used inside checkout list */
Object.assign(checkoutList, {});
