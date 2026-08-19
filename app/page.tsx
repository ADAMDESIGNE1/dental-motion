"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  image: string;
};

type SavedDoctor = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  url: string;
};

type FeaturedDoctor = {
  id: string;
  slug: string | null;
  full_name: string | null;
  specialty: string | null;
  profile_image: string | null;
  clinic_name: string | null;
  featured_until: string | null;
};

const doctors: Doctor[] = [
  {
    id: "doctor1",
    name: "DR GHASSAN",
    specialty: "MOTION DENTAL",
    image: "/doctor1.JPG",
  },
  {
    id: "doctor2",
    name: "DR SAIF",
    specialty: "DR SAIF",
    image: "/doctor2.JPG",
  },
  {
    id: "doctor3",
    name: "DR MOHAMMED",
    specialty: "DR MOHAMMED",
    image: "/doctor3.JPG",
  },
  {
    id: "doctor4",
    name: "Dr ABDULLAH",
    specialty: "Dr ABDULLAH",
    image: "/doctor4.PNG",
  },
  {
    id: "doctor5",
    name: "Dr.ABAAS",
    specialty: "Dr.ABAAS",
    image: "/doctor5.PNG",
  },
  {
    id: "doctor6",
    name: "Dr.HUSSAIN LAB",
    specialty: "Dr.HUSSAIN LAB",
    image: "/doctor6.PNG",
  },
  {
    id: "doctor7",
    name: "Dr.AHMEED",
    specialty: "Dr.AHMEED",
    image: "/doctor7.PNG",
  },
  {
    id: "doctor8",
    name: "Dr.MARAB",
    specialty: "Dr.MARAB",
    image: "/doctor8.PNG",
  },
  {
    id: "doctor9",
    name: "Dr AYSAR",
    specialty: "Dr AYSAR",
    image: "/doctor9.PNG",
  },
  {
    id: "doctor10",
    name: "Dr BASSMA",
    specialty: "Dr BASSMA",
    image: "/doctor10.PNG",
  },
  {
    id: "doctor11",
    name: "Dr.SANNA",
    specialty: "Dr.SANNA",
    image: "/doctor11.PNG",
  },
  {
    id: "doctor12",
    name: "Dr.MARYAM",
    specialty: "Dr.MARYAM",
    image: "/doctor12.PNG",
  },
];

const subscriptionPlans = [
  {
    id: "basic",
    number: "01",
    label: "BASIC",
    title: "الباقة العادية",
    price: "25,000",
    description:
      "وجود احترافي أساسي للطبيب داخل ADAM DESIGN مع صفحة خاصة تعرض معلوماتك وخبرتك أمام المرضى.",
    features: [
      "صفحة خاصة باسم الطبيب",
      "الصورة الشخصية",
      "الاختصاص والخبرة",
      "معلومات التواصل",
      "نبذة مهنية عن الطبيب",
      "موقع العيادة وأوقات الدوام",
      "روابط Instagram / TikTok / Facebook",
      "عرض حالات قبل وبعد (حالتان فقط)",
    ],
  },
  {
    id: "premium",
    number: "02",
    label: "PREMIUM",
    title: "الباقة المميزة",
    price: "50,000",
    description:
      "حضور احترافي متكامل للطبيب مع مساحة أكبر لعرض أعمالك وشهاداتك وخدماتك وبناء ثقة أقوى مع المرضى.",
    popular: true,
    features: [
      "كل مميزات الباقة العادية",
      "حتى 150 حالة Before / After",
      "عرض الشهادات والمؤهلات",
      "عرض الخدمات والتخصصات",
      "Before / After بالسحب التفاعلي",
      "آراء المرضى وتقييم النجوم",
      "زر حجز WhatsApp ثابت بالموبايل",
      "QR خاص بموقع الطبيب",
      "إحصائيات الزيارات وضغطات WhatsApp",
      "بحث وفلترة الحالات حسب النوع",
      "إحصائيات طلبات المواعيد والخدمات",
      "SEO ومشاركة احترافية لمحركات البحث",
      "3 Themes للموقع: Dark Blue / Black & Gold / Clean White",
      "واجهة احترافية للطبيب",
      "مساحة أكبر لأعمال قبل وبعد",
      "ملف طبي أكثر تفصيلاً",
      "ظهور احترافي أقوى أمام المرضى",
    ],
  },
 ];

const PAYMENT_INFO = {
  zaincash: {
    label: "Zain Cash",
    number: "07803447144",
  },
  kcard: {
    label: "Qi Card / كي كارد",
    number: "7159038244",
  },
};

export default function HomePage() {
  const router = useRouter();
  const [canSeeAdmin, setCanSeeAdmin] =
    useState(false);
  const [savedDoctors, setSavedDoctors] =
    useState<SavedDoctor[]>([]);
  const [featuredDoctors, setFeaturedDoctors] =
    useState<FeaturedDoctor[]>([]);

  useEffect(() => {
    let mounted = true;

    async function checkAdminAccess() {
      try {
        const {
          data: sessionData,
        } = await supabase.auth.getSession();

        const user =
          sessionData.session?.user;

        if (!user) {
          if (mounted) {
            setCanSeeAdmin(false);
          }
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (!mounted) return;

        setCanSeeAdmin(
          !error && Boolean(data)
        );
      } catch {
        if (mounted) {
          setCanSeeAdmin(false);
        }
      }
    }

    checkAdminAccess();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      () => {
        checkAdminAccess();
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedDoctors() {
      const now =
        new Date().toISOString();

      const {
        data,
        error,
      } =
        await supabase
          .from("doctors")
          .select(
            "id,slug,full_name,specialty,profile_image,clinic_name,featured_until"
          )
          .eq(
            "featured_active",
            true
          )
          .eq(
            "subscription_active",
            true
          )
          .eq(
            "is_approved",
            true
          )
          .gt(
            "featured_until",
            now
          )
          .gt(
            "subscription_expires_at",
            now
          )
          .order(
            "featured_until",
            {
              ascending: true,
            }
          )
          .limit(12);

      if (!mounted) return;

      if (error) {
        console.error(
          "LOAD FEATURED DOCTORS:",
          error
        );
        setFeaturedDoctors([]);
        return;
      }

      setFeaturedDoctors(
        (data ||
          []) as FeaturedDoctor[]
      );
    }

    void loadFeaturedDoctors();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function loadSavedDoctors() {
      try {
        const raw =
          localStorage.getItem(
            "saved-doctors"
          );

        const parsed =
          raw
            ? JSON.parse(raw)
            : [];

        setSavedDoctors(
          Array.isArray(parsed)
            ? parsed.filter(
                (
                  item: unknown
                ): item is SavedDoctor =>
                  Boolean(
                    item &&
                      typeof item === "object" &&
                      "id" in item &&
                      "url" in item
                  )
              )
            : []
        );
      } catch {
        setSavedDoctors([]);
      }
    }

    loadSavedDoctors();

    window.addEventListener(
      "storage",
      loadSavedDoctors
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadSavedDoctors
      );
    };
  }, []);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      targetX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      targetY =
        (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      currentX +=
        (targetX - currentX) * 0.035;

      currentY +=
        (targetY - currentY) * 0.035;

      document.documentElement.style.setProperty(
        "--mouse-x",
        String(currentX)
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        String(currentY)
      );

      animationFrame =
        requestAnimationFrame(animate);
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  function openSubscription(
    plan: "basic" | "premium"
  ) {
    router.push(
      "/subscription?plan=" + plan
    );
  }

  function sendServiceWhatsApp(serviceTitle: string, servicePrice: string) {
    const phone = "9647803447144";
    const message =
      `مرحباً ADAM DESIGN 👋

أريد خدمة ${serviceTitle}.
السعر: ${servicePrice}

أريد أعرف التفاصيل.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyPaymentNumber(
    value: string
  ) {
    try {
      await navigator.clipboard.writeText(value);
      window.alert("تم نسخ الرقم.");
    } catch {
      window.alert(
        "تعذر نسخ الرقم. يمكنك نسخه يدوياً."
      );
    }
  }

  function openAdmin() {
    router.push("/admin/subscriptions");
  }

  return (
    <main className="home-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="cyber-background"
        aria-hidden="true"
      >
        <div className="cyber-image" />
        <div className="cyber-dark" />

        <div className="cyber-blue-glow glow-one" />
        <div className="cyber-blue-glow glow-two" />
        <div className="cyber-purple-glow glow-three" />

        <div className="cyber-grid" />
        <div className="cyber-scanline" />

        <div className="cyber-particles">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="personal-hero">

        <div className="personal-hero-content">

          <span className="personal-hero-label">
            DENTAL MOTION
          </span>

          <div className="hero-line-small" />

          <h1>
            ADAM
            <br />
            <span>DESGINE</span>
          </h1>

          <h2>
            MOTION DENTAL
          </h2>

          <p>
            التميز في التصميم، الدقة في كل تفصيل،
            وصناعة محتوى يليق بابتسامة كل طبيب.
          </p>

          <div className="personal-hero-line" />

          <span className="personal-hero-scroll">
            مرر للأسفل للتعرف على الفريق
          </span>

          {canSeeAdmin && (
            <button
              type="button"
              className="home-admin-button"
              onClick={openAdmin}
            >
              دخول الإدارة
            </button>
          )}

        </div>


        <div className="personal-hero-image-wrap">

          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="personal-hero-frame" />

          <span className="personal-hero-number">
            01
          </span>

          <div className="hero-image-glow" />

          <img
            src="/hero-person.png"
            alt="Adam Desgine"
            className="personal-hero-image"
          />

          <div className="hero-image-label">
            <span>PRECISION</span>
            <span>01 / 04</span>
          </div>

        </div>

      </section>

      {savedDoctors.length > 0 && (
        <section
          dir="rtl"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 24px 42px",
          }}
        >
          <div
            style={{
              padding: 20,
              background:
                "rgba(0,10,20,.46)",
              border:
                "1px solid rgba(50,186,255,.16)",
            }}
          >
            <span
              className="hero-small-label"
            >
              محفوظاتك
            </span>

            <h2
              style={{
                margin: "8px 0 14px",
                color: "#fff",
                fontSize: 28,
              }}
            >
              أطباء حفظتهم على هذا الجهاز
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(210px,1fr))",
                gap: 10,
              }}
            >
              {savedDoctors.map(
                (doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() =>
                      window.location.assign(
                        doctor.url
                      )
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "58px minmax(0,1fr)",
                      gap: 10,
                      alignItems: "center",
                      padding: 10,
                      textAlign: "right",
                      cursor: "pointer",
                      color: "#fff",
                      background:
                        "rgba(255,255,255,.025)",
                      border:
                        "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <img
                      src={
                        doctor.image ||
                        "/logo.png"
                      }
                      alt={doctor.name}
                      style={{
                        width: 58,
                        height: 58,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border:
                          "1px solid rgba(50,186,255,.18)",
                      }}
                    />

                    <span>
                      <strong
                        style={{
                          display: "block",
                          fontSize: 11,
                        }}
                      >
                        {doctor.name}
                      </strong>

                      <small
                        style={{
                          display: "block",
                          marginTop: 4,
                          color:
                            "rgba(255,255,255,.45)",
                          fontSize: 9,
                        }}
                      >
                        {doctor.specialty}
                      </small>
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </section>
      )}


      {featuredDoctors.length > 0 && (
        <section
          dir="rtl"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1180,
            margin: "0 auto 52px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <span
                className="hero-small-label"
                style={{
                  color: "#ffbf69",
                }}
              >
                FEATURED DOCTORS
              </span>

              <h2
                style={{
                  margin: "8px 0 0",
                  color: "#fff",
                  fontFamily: "Georgia, serif",
                  fontSize: "clamp(30px,4vw,46px)",
                  fontWeight: 400,
                }}
              >
                أطباء مميزون
              </h2>
            </div>

            <p
              style={{
                maxWidth: 520,
                margin: 0,
                color: "rgba(255,255,255,.42)",
                fontSize: 11,
                lineHeight: 1.9,
              }}
            >
              أطباء باشتراك فعال اختاروا ظهوراً مميزاً داخل المنصة.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(240px,300px))",
              justifyContent: "start",
              gap: 14,
            }}
          >
            {featuredDoctors.map(
              (doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/doctor/${
                        doctor.slug ||
                        doctor.id
                      }`
                    )
                  }
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    width: "100%",
                    maxWidth: 300,
                    minHeight: 315,
                    padding: 0,
                    textAlign: "right",
                    color: "#fff",
                    cursor: "pointer",
                    border:
                      "1px solid rgba(255,191,105,.34)",
                    background:
                      "linear-gradient(145deg,rgba(255,191,105,.08),rgba(2,7,17,.96))",
                    boxShadow:
                      "0 20px 55px rgba(0,0,0,.24)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      zIndex: 3,
                      padding: "7px 9px",
                      color: "#160f05",
                      background: "#ffbf69",
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: ".12em",
                    }}
                  >
                    ★ FEATURED
                  </div>

                  <div
                    style={{
                      height: 185,
                      overflow: "hidden",
                      background:
                        "rgba(255,255,255,.025)",
                    }}
                  >
                    {doctor.profile_image ? (
                      <img
                        src={doctor.profile_image}
                        alt={
                          doctor.full_name ||
                          "Featured doctor"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          color:
                            "rgba(255,255,255,.18)",
                          fontSize: 40,
                        }}
                      >
                        DR
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: 16,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#fff",
                        fontSize: 15,
                      }}
                    >
                      د.{" "}
                      {doctor.full_name ||
                        "طبيب"}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: 5,
                        color: "#ffbf69",
                        fontSize: 9,
                      }}
                    >
                      {doctor.specialty ||
                        "Dental Doctor"}
                    </span>

                    {doctor.clinic_name && (
                      <small
                        style={{
                          display: "block",
                          marginTop: 8,
                          color:
                            "rgba(255,255,255,.38)",
                          fontSize: 8,
                        }}
                      >
                        {doctor.clinic_name}
                      </small>
                    )}

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 12,
                        color:
                          "rgba(255,255,255,.58)",
                        fontSize: 9,
                      }}
                    >
                      عرض موقع الطبيب ↗
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          DOCTORS
      ===================================================== */}

      <section className="doctors-section">

        <div className="doctors-heading">

          <div>

            <span className="hero-small-label">
              أطباؤنا المختصون
            </span>

            <h2>
              الفريق الكامل
              <br />
              <span>خلف كل ابتسامة</span>
            </h2>

          </div>

          <p>
            تعرف على أطبائنا المختصين واستكشف أعمالهم
            وعلاجاتهم وتحولات ابتسامات مرضاهم.
          </p>

        </div>


        <div className="doctors-grid">

          {doctors.map(
            (doctor, index) => (

              <button
                key={doctor.id}
                type="button"
                className="doctor-card"
                onClick={() =>
                  router.push(
                    "/doctor/" +
                    doctor.id
                  )
                }
              >

                <div className="doctor-image-wrap">

                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="doctor-image"
                  />

                  <div className="doctor-gold-frame" />

                  <div className="doctor-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="doctor-hover">

                    <span>
                      عرض الملف
                    </span>

                    <span className="arrow">
                      ↗
                    </span>

                  </div>

                </div>


                <div className="doctor-info">

                  <span>
                    {doctor.specialty}
                  </span>

                  <h3>
                    {doctor.name}
                  </h3>

                </div>

              </button>

            )
          )}

        </div>

      </section>


      {/* =====================================================
          PRICING
      ===================================================== */}

      <section className="pricing-section">

        <div className="pricing-heading">

          <div>

            <span className="hero-small-label">
              الاشتراك والخدمات
            </span>

            <h2>
              اختر ما
              <br />
              <span>تحتاجه بالضبط</span>
            </h2>

          </div>

          <p>
            إذا تريد صفحة وموقع خاص باسمك، ابدأ من باقات الاشتراك.
            وإذا تريد خدمة تصميم فقط بدون اشتراك، ستجد الخدمات
            الإضافية بشكل منفصل أسفل هذا القسم.
          </p>

        </div>


        {/* =================================================
            HOW SUBSCRIPTION WORKS
        ================================================= */}

        <section className="subscription-steps-section">
          <div className="subscription-steps-heading">
            <span className="hero-small-label">
              شلون يصير الاشتراك؟
            </span>

            <h3>
              أربع خطوات فقط
            </h3>

            <p>
              من اختيار الباقة إلى استلام رابط التسجيل وفتح صفحتك الخاصة.
            </p>
          </div>

          <div className="subscription-steps-grid">
            <div className="subscription-step-card">
              <span>01</span>
              <strong>اختر الباقة</strong>
              <p>
                اختر الباقة العادية أو المميزة حسب احتياجك.
              </p>
            </div>

            <div className="subscription-step-card">
              <span>02</span>
              <strong>حوّل المبلغ</strong>
              <p>
                حوّل سعر الباقة على زين كاش أو كي كارد.
              </p>
            </div>

            <div className="subscription-step-card">
              <span>03</span>
              <strong>ارفع الوصل</strong>
              <p>
                ارفع صورة الوصل ورقم العملية حتى يصل الطلب للإدارة.
              </p>
            </div>

            <div className="subscription-step-card">
              <span>04</span>
              <strong>استلم رابط التسجيل</strong>
              <p>
                بعد الموافقة يصلك رابط على WhatsApp، تسجل وتكمل معلوماتك وتفتح صفحتك.
              </p>
            </div>
          </div>
        </section>


        {/* =================================================
            SUBSCRIPTION
        ================================================= */}

        <section className="subscription-home-section">

          <div className="subscription-home-heading">

            <div>

              <span className="hero-small-label">
                اشتراك موقع الطبيب
              </span>

              <h2>
                اختر باقتك
                <br />
                <span>
                  وابدأ صفحتك الخاصة
                </span>
              </h2>

            </div>

            <p>
              هذا القسم مخصص للطبيب الذي يريد صفحة وموقع خاص باسمه.
              بعد اختيار الباقة ستنتقل إلى نموذج الطلب ورفع وصل الدفع.
            </p>

          </div>


          <div className="subscription-home-grid">

            {subscriptionPlans.map(
              (plan) => (

                <div
                  key={plan.id}
                  role="button"
                  tabIndex={0}
                  className={
                    "subscription-home-card " +
                    (
                      plan.popular
                        ? "subscription-home-card-popular"
                        : ""
                    )
                  }
                  onClick={() =>
                    openSubscription(
                      plan.id as
                        | "basic"
                        | "premium"
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      openSubscription(
                        plan.id as
                          | "basic"
                          | "premium"
                      );
                    }
                  }}
                >

                  {plan.popular && (
                    <div className="subscription-popular-badge">
                      الأكثر اختياراً
                    </div>
                  )}

                  <div className="subscription-card-top">

                    <span className="subscription-card-number">
                      {plan.number}
                    </span>

                    <span className="subscription-card-label">
                      {plan.label}
                    </span>

                  </div>


                  <div className="subscription-card-content">

                    <span className="subscription-card-small">
                      ADAM DESIGN
                    </span>

                    <h3>{plan.title}</h3>

                    <p>
                      {plan.description}
                    </p>

                  </div>


                  <div className="subscription-card-price">

                    <strong>
                      {plan.price}
                    </strong>

                    <span>
                      د.ع
                    </span>

                    <small>
                      / اشتراك
                    </small>

                  </div>


                  <div className="subscription-card-line" />


                  <div className="subscription-features">

                    {plan.features
                      .slice(0, 6)
                      .map(
                        (
                          feature,
                          index
                        ) => (

                          <div
                            key={index}
                            className="subscription-feature"
                          >

                            <span>
                              ✓
                            </span>

                            <p>
                              {feature}
                            </p>

                          </div>

                        )
                      )}

                  </div>


                  <div className="subscription-card-action">

                    <span>
                      اختر الباقة وابدأ الطلب
                    </span>

                    <b>
                      ↗
                    </b>

                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      router.push(
                        plan.id === "premium"
                          ? "/demo-premium"
                          : "/demo-basic"
                      );
                    }}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                    }}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      padding: "12px 14px",
                      border:
                        plan.id === "premium"
                          ? "1px solid rgba(199,168,93,.35)"
                          : "1px solid rgba(50,186,255,.28)",
                      background:
                        plan.id === "premium"
                          ? "rgba(199,168,93,.07)"
                          : "rgba(50,186,255,.055)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {plan.id === "premium"
                      ? "شاهد نموذج الباقة المميزة"
                      : "شاهد نموذج الباقة العادية"}
                  </button>

                </div>

              )
            )}

          </div>


          <div className="payment-home-box">
            <div className="payment-home-heading">
              <span className="hero-small-label">
                بعد اختيار الباقة
              </span>

              <h3>
                حوّل سعر الباقة على أحد الحسابين
              </h3>

              <p>
                انسخ الرقم المناسب، نفّذ التحويل، ثم اضغط على الباقة
                لرفع الوصل وكتابة رقم العملية وإرسال الطلب للإدارة.
              </p>
            </div>

            <div className="payment-home-grid">
              <div className="payment-home-card">
                <span className="payment-home-label">
                  {PAYMENT_INFO.zaincash.label}
                </span>

                <strong>
                  {PAYMENT_INFO.zaincash.number}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    copyPaymentNumber(
                      PAYMENT_INFO.zaincash.number
                    )
                  }
                >
                  نسخ رقم زين كاش
                </button>
              </div>

              <div className="payment-home-card">
                <span className="payment-home-label">
                  {PAYMENT_INFO.kcard.label}
                </span>

                <strong>
                  {PAYMENT_INFO.kcard.number}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    copyPaymentNumber(
                      PAYMENT_INFO.kcard.number
                    )
                  }
                >
                  نسخ رقم البطاقة
                </button>
              </div>
            </div>
          </div>

          <div
            className="subscription-more-button"
            onClick={() =>
              openSubscription(
                "basic"
              )
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {

              if (
                event.key ===
                  "Enter" ||
                event.key === " "
              ) {
                openSubscription(
                  "basic"
                );
              }

            }}
          >

            <span>
              ابدأ طلب الاشتراك الآن
            </span>

            <b>
              ↗
            </b>

          </div>

        </section>


        {/* =================================================
            DESIGN SERVICES
        ================================================= */}

        <section className="design-services-intro">
          <div>
            <span className="hero-small-label">
              خدمات إضافية مستقلة
            </span>

            <h3>
              تريد تصميم فقط؟
            </h3>
          </div>

          <p>
            الخدمات التالية ليست اشتراك موقع الطبيب.
            تقدر تطلب فيديو قبل/بعد، تعديل صور، شعار أو مونتاج بشكل منفصل.
          </p>
        </section>

        <div className="pricing-grid">

          <div className="pricing-card">

            <div className="pricing-number">
              01
            </div>

            <span className="pricing-category">
              تصميم فيديو
            </span>

            <h3>
              فيديو قبل
              <br />
              وبعد
            </h3>

            <p>
              تصميم فيديو احترافي لعرض حالة الأسنان
              قبل وبعد العلاج، مع إمكانية تحديد مدة
              الفيديو وأسلوبه حسب طلب الطبيب.
            </p>

            <div className="pricing-price">

              <strong>
                45,000
              </strong>

              <span>
                د.ع
              </span>

              <b>
                —
              </b>

              <strong>
                75,000
              </strong>

              <span>
                د.ع
              </span>

            </div>

            <div className="pricing-line" />

            <span className="pricing-note">
              السعر حسب طلب الطبيب ومدة الفيديو
            </span>

            <button
              type="button"
              onClick={() => sendServiceWhatsApp("فيديو قبل وبعد", "45,000 — 75,000 د.ع")}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "11px 12px",
                background: "rgba(37,211,102,.06)",
                color: "#62e89a",
                border: "1px solid rgba(37,211,102,.24)",
                cursor: "pointer",
                fontSize: 9,
              }}
            >
              استفسر عن هذه الخدمة عبر WhatsApp
            </button>

          </div>


          <div className="pricing-card">

            <div className="pricing-number">
              02
            </div>

            <span className="pricing-category">
              تعديل الصور
            </span>

            <h3>
              تعديل صور
              <br />
              الأسنان
            </h3>

            <p>
              تعديل وتحسين صور الأسنان بشكل احترافي
              لتناسب عرض الحالات السريرية والمحتوى
              الخاص بالطبيب على مواقع التواصل.
            </p>

            <div className="pricing-price">

              <strong>
                5,000
              </strong>

              <span>
                د.ع
              </span>

              <b>
                —
              </b>

              <strong>
                15,000
              </strong>

              <span>
                د.ع
              </span>

            </div>

            <div className="pricing-line" />

            <span className="pricing-note">
              السعر حسب عدد الصور ونوع التعديل
            </span>

            <button
              type="button"
              onClick={() => sendServiceWhatsApp("تعديل صور الأسنان", "5,000 — 15,000 د.ع")}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "11px 12px",
                background: "rgba(37,211,102,.06)",
                color: "#62e89a",
                border: "1px solid rgba(37,211,102,.24)",
                cursor: "pointer",
                fontSize: 9,
              }}
            >
              استفسر عن هذه الخدمة عبر WhatsApp
            </button>

          </div>


          <div className="pricing-card">

            <div className="pricing-number">
              03
            </div>

            <span className="pricing-category">
              هوية بصرية
            </span>

            <h3>
              تصميم شعار
              <br />
              احترافي
            </h3>

            <p>
              تصميم شعار احترافي ومميز للطبيب أو
              العيادة، بأسلوب خاص يعكس الهوية
              والشخصية المهنية.
            </p>

            <div className="pricing-price">

              <strong>
                100,000
              </strong>

              <span>
                د.ع
              </span>

            </div>

            <div className="pricing-line" />

            <span className="pricing-note">
              تصميم شعار احترافي
            </span>

            <button
              type="button"
              onClick={() => sendServiceWhatsApp("تصميم شعار احترافي", "100,000 د.ع")}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "11px 12px",
                background: "rgba(37,211,102,.06)",
                color: "#62e89a",
                border: "1px solid rgba(37,211,102,.24)",
                cursor: "pointer",
                fontSize: 9,
              }}
            >
              استفسر عن هذه الخدمة عبر WhatsApp
            </button>

          </div>


          <div className="pricing-card">

            <div className="pricing-number">
              04
            </div>

            <span className="pricing-category">
              مونتاج فيديو
            </span>

            <h3>
              مونتاج
              <br />
              احترافي
            </h3>

            <p>
              مونتاج احترافي لفيديوهات الأطباء
              والعيادات، مناسب للمحتوى الطبي
              والإعلانات ومواقع التواصل الاجتماعي.
            </p>

            <div className="pricing-price">

              <strong>
                100,000
              </strong>

              <span>
                د.ع
              </span>

            </div>

            <div className="pricing-line" />

            <span className="pricing-note">
              مونتاج فيديو احترافي
            </span>

            <button
              type="button"
              onClick={() => sendServiceWhatsApp("مونتاج فيديو احترافي", "100,000 د.ع")}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "11px 12px",
                background: "rgba(37,211,102,.06)",
                color: "#62e89a",
                border: "1px solid rgba(37,211,102,.24)",
                cursor: "pointer",
                fontSize: 9,
              }}
            >
              استفسر عن هذه الخدمة عبر WhatsApp
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section className="contact-section">

        <div className="contact-glow" />

        <div className="contact-content">

          <span className="contact-label">
            DENTAL MOTION
          </span>

          <h2>
            Every smile
            <br />
            <span>
              tells a story.
            </span>
          </h2>

          <p>
            Precision. Design. Motion.
            <br />
            Your smile deserves all three.
          </p>

          <div className="contact-actions">

            <a href="tel:+9647803447144">
              اتصل بنا
            </a>

            <a href="mailto:salieeeem543@gmail.com">
              راسلنا
            </a>

          </div>

        </div>


        <div className="contact-person">

          <div className="contact-circle">

            <img
              src="/hero-person.png"
              alt="Adam Desgine"
            />

          </div>

          <div className="contact-person-line" />

          <span>
            ADAM DESGINE
          </span>

          <small>
            MOTION DENTAL
          </small>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="home-footer">

        <span>
          DENTAL MOTION
        </span>

        <p>
          MOTION GRAPHICS × DENTISTRY
        </p>

        <small>
          © 2026 Dental Motion
        </small>

      </footer>


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        .subscription-steps-section {
          margin: 34px 0 26px;
          padding: 28px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.02),
              rgba(0,140,255,.035)
            );
          border: 1px solid rgba(255,255,255,.08);
        }

        .subscription-steps-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .subscription-steps-heading h3 {
          margin: 8px 0 0;
          color: #fff;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
        }

        .subscription-steps-heading p {
          max-width: 520px;
          margin: 0;
          color: rgba(255,255,255,.45);
          font-size: 11px;
          line-height: 1.9;
        }

        .subscription-steps-grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 12px;
        }

        .subscription-step-card {
          min-height: 155px;
          padding: 18px;
          background: rgba(1,6,14,.72);
          border: 1px solid rgba(0,140,255,.14);
        }

        .subscription-step-card > span {
          display: block;
          margin-bottom: 18px;
          color: #c7a85d;
          font-size: 10px;
          letter-spacing: .16em;
        }

        .subscription-step-card strong {
          display: block;
          margin-bottom: 8px;
          color: #fff;
          font-size: 14px;
        }

        .subscription-step-card p {
          margin: 0;
          color: rgba(255,255,255,.45);
          font-size: 10px;
          line-height: 1.8;
        }

        .design-services-intro {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin: 48px 0 20px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .design-services-intro h3 {
          margin: 8px 0 0;
          color: #fff;
          font-family: Georgia, serif;
          font-size: 30px;
          font-weight: 400;
        }

        .design-services-intro p {
          max-width: 560px;
          margin: 0;
          color: rgba(255,255,255,.45);
          font-size: 11px;
          line-height: 1.9;
        }

        .subscription-home-section {
          position: relative;
          margin: 55px 0 65px;
          padding: 38px;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              rgba(0,140,255,.08),
              rgba(2,7,17,.94)
            );

          border:
            1px solid
            rgba(0,140,255,.18);
        }

        .subscription-home-section::before {
          content: "";
          position: absolute;

          width: 450px;
          height: 450px;

          top: -250px;
          left: -180px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(0,140,255,.12),
              transparent 70%
            );

          pointer-events: none;
        }

        .subscription-home-heading {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 40px;

          margin-bottom: 32px;
        }

        .subscription-home-heading h2 {
          margin: 12px 0 0;

          color: #fff;

          font-family: Georgia, serif;

          font-size: 36px;

          line-height: 1.25;

          font-weight: 400;
        }

        .subscription-home-heading h2 span {
          color: #32baff;
        }

        .subscription-home-heading p {
          max-width: 550px;

          margin: 0;

          color:
            rgba(255,255,255,.45);

          font-size: 12px;

          line-height: 2;
        }

        .subscription-home-grid {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 18px;
        }

        .subscription-home-card {
          position: relative;

          width: 100%;

          min-height: 490px;

          padding: 27px;

          text-align: right;

          color: #fff;

          background:
            linear-gradient(
              145deg,
              rgba(5,14,28,.98),
              rgba(1,5,12,.98)
            );

          border:
            1px solid
            rgba(255,255,255,.08);

          cursor: pointer;

          overflow: hidden;

          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease;
        }

        .subscription-home-card::after {
          content: "";

          position: absolute;

          width: 180px;
          height: 180px;

          right: -80px;
          bottom: -90px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(0,140,255,.13),
              transparent 70%
            );

          pointer-events: none;
        }

        .subscription-home-card:hover {
          transform: translateY(-6px);

          border-color:
            rgba(0,160,255,.55);

          box-shadow:
            0 20px 60px
            rgba(0,110,255,.13);
        }

        .subscription-home-card-popular {
          border-color:
            rgba(0,140,255,.38);

          background:
            linear-gradient(
              145deg,
              rgba(0,50,90,.45),
              rgba(2,7,17,.98)
            );
        }

        .subscription-popular-badge {
          position: absolute;

          top: 0;
          left: 0;

          padding: 8px 14px;

          background: #008cff;

          color: #fff;

          font-size: 9px;

          z-index: 5;
        }

        .subscription-card-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 35px;
        }

        .subscription-card-number {
          color:
            rgba(199,168,93,.7);

          font-size: 10px;

          letter-spacing: .18em;
        }

        .subscription-card-label {
          color: #32baff;

          font-size: 9px;

          letter-spacing: .2em;
        }

        .subscription-card-content {
          position: relative;
          z-index: 2;
        }

        .subscription-card-small {
          display: block;

          margin-bottom: 8px;

          color: #c7a85d;

          font-size: 9px;

          letter-spacing: .16em;
        }

        .subscription-card-content h3 {
          margin: 0 0 13px;

          color: #fff;

          font-family: Georgia, serif;

          font-size: 29px;

          font-weight: 400;
        }

        .subscription-card-content p {
          min-height: 62px;

          margin: 0;

          color:
            rgba(255,255,255,.47);

          font-size: 11px;

          line-height: 1.9;
        }

        .subscription-card-price {
          position: relative;
          z-index: 2;

          display: flex;

          align-items: baseline;

          gap: 7px;

          margin-top: 25px;
        }

        .subscription-card-price strong {
          color: #fff;

          font-family: Georgia, serif;

          font-size: 34px;

          font-weight: 400;
        }

        .subscription-card-price span {
          color: #32baff;

          font-size: 12px;
        }

        .subscription-card-price small {
          color:
            rgba(255,255,255,.3);

          font-size: 9px;
        }

        .subscription-card-line {
          height: 1px;

          margin: 20px 0;

          background:
            rgba(255,255,255,.08);
        }

        .subscription-features {
          position: relative;
          z-index: 2;

          display: flex;

          flex-direction: column;

          gap: 9px;
        }

        .subscription-feature {
          display: flex;

          align-items: flex-start;

          gap: 9px;
        }

        .subscription-feature span {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 16px;
          height: 16px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            rgba(0,140,255,.11);

          color: #32baff;

          font-size: 9px;
        }

        .subscription-feature p {
          margin: 0;

          color:
            rgba(255,255,255,.55);

          font-size: 10px;

          line-height: 1.6;
        }

        .subscription-card-action {
          position: relative;
          z-index: 2;

          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-top: 23px;

          padding: 12px 15px;

          background:
            rgba(0,140,255,.07);

          border:
            1px solid
            rgba(0,140,255,.22);

          color: #32baff;

          font-size: 11px;
        }

        .subscription-home-card:hover
        .subscription-card-action {
          background: #008cff;

          color: #fff;
        }

        .subscription-card-action b {
          font-size: 17px;

          font-weight: 400;
        }

        .subscription-more-button {
          position: relative;
          z-index: 3;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 14px;

          width: fit-content;

          margin: 25px auto 0;

          padding: 12px 20px;

          color:
            rgba(255,255,255,.65);

          background:
            rgba(255,255,255,.025);

          border:
            1px solid
            rgba(255,255,255,.08);

          font-size: 10px;

          cursor: pointer;
        }

        .subscription-more-button b {
          color: #32baff;

          font-size: 16px;

          font-weight: 400;
        }

        .home-admin-button {
          margin-top: 22px;
          padding: 10px 16px;
          background: rgba(255,255,255,.025);
          color: rgba(255,255,255,.55);
          border: 1px solid rgba(255,255,255,.08);
          font-size: 9px;
          letter-spacing: .12em;
          cursor: pointer;
        }

        .home-admin-button:hover {
          color: #32baff;
          border-color: rgba(0,140,255,.35);
        }

        .payment-home-box {
          position: relative;
          z-index: 3;
          margin-top: 26px;
          padding: 24px;
          background:
            linear-gradient(
              135deg,
              rgba(199,168,93,.055),
              rgba(0,140,255,.045)
            );
          border: 1px solid rgba(199,168,93,.18);
        }

        .payment-home-heading h3 {
          margin: 10px 0 8px;
          color: #fff;
          font-family: Georgia, serif;
          font-size: 24px;
          font-weight: 400;
        }

        .payment-home-heading p {
          margin: 0;
          color: rgba(255,255,255,.45);
          font-size: 11px;
          line-height: 1.9;
        }

        .payment-home-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .payment-home-card {
          padding: 18px;
          background: rgba(1,6,14,.72);
          border: 1px solid rgba(255,255,255,.08);
        }

        .payment-home-label {
          display: block;
          color: #c7a85d;
          font-size: 10px;
          margin-bottom: 10px;
          letter-spacing: .08em;
        }

        .payment-home-card strong {
          display: block;
          color: #fff;
          font-family: Georgia, serif;
          font-size: 24px;
          letter-spacing: .04em;
          direction: ltr;
          text-align: right;
        }

        .payment-home-card button {
          width: 100%;
          margin-top: 14px;
          padding: 10px 12px;
          background: rgba(0,140,255,.08);
          color: #32baff;
          border: 1px solid rgba(0,140,255,.25);
          cursor: pointer;
          font-size: 10px;
        }

        .payment-home-card button:hover {
          background: #008cff;
          color: #fff;
        }

        @media (max-width: 800px) {

          /* الأطباء بالموبايل: سحب أفقي بدل النزول بالطول */
          .doctors-section {
            overflow: visible;
          }

          .doctors-grid {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 82vw !important;
            grid-template-columns: none !important;
            gap: 16px !important;

            width: calc(100vw - 20px) !important;
            margin-left: calc(50% - 50vw + 10px) !important;
            margin-right: calc(50% - 50vw + 10px) !important;
            padding: 0 10px 18px !important;

            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-inline: 10px !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-inline: contain;
            scrollbar-width: none;
          }

          .doctors-grid::-webkit-scrollbar {
            display: none;
          }

          .doctor-card {
            width: 100% !important;
            min-width: 0 !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .doctor-image-wrap {
            width: 100% !important;
          }

          .doctor-image {
            width: 100% !important;
            height: auto !important;
            display: block !important;
          }

          .subscription-home-section {
            padding: 25px 20px;
          }

          .subscription-home-heading {
            display: block;
          }

          .subscription-home-heading p {
            margin-top: 20px;
          }

          /* الاشتراكات والخدمات بالموبايل: بطاقات أفقية بالسحب */
          .subscription-home-grid,
          .pricing-grid {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 82vw !important;
            grid-template-columns: none !important;
            gap: 16px !important;

            width: calc(100vw - 20px) !important;
            margin-left: calc(50% - 50vw + 10px) !important;
            margin-right: calc(50% - 50vw + 10px) !important;
            padding: 0 10px 18px !important;

            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-inline: 10px !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-inline: contain;
            scrollbar-width: none;
          }

          .subscription-home-grid::-webkit-scrollbar,
          .pricing-grid::-webkit-scrollbar {
            display: none;
          }

          .subscription-home-card,
          .pricing-card {
            width: 100% !important;
            min-width: 0 !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .payment-home-grid {
            grid-template-columns: 1fr;
          }

          .subscription-steps-heading,
          .design-services-intro {
            display: block;
          }

          .subscription-steps-heading p,
          .design-services-intro p {
            margin-top: 14px;
          }

          .subscription-steps-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

        }

        @media (max-width: 500px) {

          .doctors-grid,
          .subscription-home-grid,
          .pricing-grid {
            grid-auto-columns: 86vw !important;
            gap: 13px !important;
          }

          .subscription-home-heading h2 {
            font-size: 29px;
          }

          .subscription-home-card {
            min-height: auto;
            padding: 22px;
          }

          .subscription-card-content h3 {
            font-size: 25px;
          }

          .subscription-card-price strong {
            font-size: 29px;
          }

          .subscription-steps-grid {
            grid-template-columns: 1fr;
          }

          .subscription-steps-section,
          .payment-home-box {
            padding: 20px;
          }

        }

      `}</style>

    </main>
  );
}