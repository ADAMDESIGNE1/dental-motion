"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

import styles from "./DoctorPage.module.css";

/* =====================================================
   TYPES
===================================================== */

type Doctor = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  sub_specialty: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  profile_image: string | null;
  certificates: string[] | null;
  slug: string | null;
  subscription_active: boolean | null;
  subscription_expires_at: string | null;
  is_approved: boolean | null;
};

type DoctorCase = {
  id: string;
  title?: string | null;
  description?: string | null;
  before_image?: string | null;
  after_image?: string | null;
  video_url?: string | null;
};

/* =====================================================
   VIDEO CARD
===================================================== */

function VideoCard({
  video,
  number,
}: {
  video: string;
  number: number;
}) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const playMutedOnHover = async () => {
    const element = videoRef.current;

    if (!element) return;

    element.currentTime = 0;

    /*
     * المتصفحات تمنع الصوت التلقائي بالـ hover
     * إذا ما صار تفاعل فعلي من المستخدم قبلها.
     * لذلك نخلي الـ hover يبدأ الفيديو، وإذا المتصفح
     * يسمح بالصوت بعد تفاعل سابق نفتح الصوت.
     */
    const userActivation =
      typeof navigator !== "undefined" &&
      "userActivation" in navigator
        ? (navigator as Navigator & {
            userActivation?: {
              hasBeenActive?: boolean;
            };
          }).userActivation
        : undefined;

    element.muted =
      !userActivation?.hasBeenActive;

    element.volume = 1;

    try {
      await element.play();
    } catch {
      element.muted = true;

      try {
        await element.play();
      } catch {}
    }
  };

  const playWithSound = async () => {
    const element = videoRef.current;

    if (!element) return;

    element.currentTime = 0;
    element.muted = false;
    element.volume = 1;

    try {
      await element.play();
    } catch {
      /*
       * إذا منع المتصفح التشغيل بالصوت، نشغله muted
       * حتى ما يبقى الفيديو متوقف.
       */
      element.muted = true;

      try {
        await element.play();
      } catch {}
    }
  };

  const stopPlayback = () => {
    const element = videoRef.current;

    if (!element) return;

    element.pause();
    element.currentTime = 0;
    element.muted = true;
  };

  return (
    <article
      className={styles.videoCard}
      onMouseEnter={
        playMutedOnHover
      }
      onMouseLeave={
        stopPlayback
      }
      onPointerDown={
        playWithSound
      }
      onTouchStart={
        playWithSound
      }
      onClick={
        playWithSound
      }
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={video}
        playsInline
        preload="metadata"
      />

      <div
        className={
          styles.videoOverlay
        }
      />

      <div
        className={
          styles.videoTop
        }
      >
        <span>
          {String(number).padStart(
            2,
            "0"
          )}
        </span>

        <span>VIDEO</span>
      </div>

      <div
        className={styles.play}
      >
        <span>🔊</span>
      </div>

      <div
        className={
          styles.videoBottom
        }
      >
        <span>
          HOVER TO PLAY • CLICK / TOUCH FOR SOUND
        </span>

        <span>↗</span>
      </div>
    </article>
  );
}

/* =====================================================
   DOCTOR PAGE
===================================================== */


type LegacyDoctor = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  phone: string;
  bio: string;
  videos: string[];
};

const R2_VIDEO_BASE = "https://pub-16b672e0754a40d4b790366e9efdc79f.r2.dev/doctor1";

const legacyDoctors: LegacyDoctor[] = [
  {
    id: "doctor1",
    name: "Dr. Ghassan",
    specialty: "Cosmetic Dentistry",
    image: "/doctor1.jpg",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in cosmetic dentistry, smile design and advanced dental treatments.",
    videos: [
    `${R2_VIDEO_BASE}/doctor1-1.mp4`,
      `${R2_VIDEO_BASE}/doctor1-2.mp4`,
      `${R2_VIDEO_BASE}/doctor1-3.mp4`,
 `${R2_VIDEO_BASE}/doctor1-4.mp4`,
      `${R2_VIDEO_BASE}/doctor1-5.mp4`,
      `${R2_VIDEO_BASE}/doctor1-6.mp4`,
    ],
  },

  {
    id: "doctor2",
    name: "DR SAIF",
    specialty: "Dental Specialist",
    image: "/doctor2.jpg",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Dental specialist focused on modern treatments and comprehensive patient care.",
    videos: [
      `${R2_VIDEO_BASE}/doctor2-1.mp4`,
      `${R2_VIDEO_BASE}/doctor2-2.mp4`,
      `${R2_VIDEO_BASE}/doctor2-3.mp4`,
 `${R2_VIDEO_BASE}/doctor2-4.mp4`,
      `${R2_VIDEO_BASE}/doctor2-5.mp4`,
      `${R2_VIDEO_BASE}/doctor2-6.mp4`,
    ],
  },

  {
    id: "doctor3",
    name: "DR MOHAMMED",
    specialty: "Aesthetic Dentistry",
    image: "/doctor3.jpg",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry, smile makeovers and modern dental solutions.",
    videos: [
      `${R2_VIDEO_BASE}/doctor3-1.mp4`,
      `${R2_VIDEO_BASE}/doctor3-2.mp4`,
      `${R2_VIDEO_BASE}/doctor3-3.mp4`,
    ],
  },

  {
    id: "doctor4",
    name: "Dr.ABDULLAH",
    specialty: "Dental Specialist",
    image: "/doctor4.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Dental specialist providing modern and precise dental treatments.",
    videos: [
      `${R2_VIDEO_BASE}/doctor4-1.mp4`,
      `${R2_VIDEO_BASE}/doctor4-2.mp4`,
      `${R2_VIDEO_BASE}/doctor4-3.mp4`,
    ],
  },

  {
    id: "doctor5",
    name: "Dr.ABBAS",
    specialty: "Dental Specialist",
    image: "/doctor5.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Dental specialist dedicated to precision, comfort and high-quality dental care.",
    videos: [
      `${R2_VIDEO_BASE}/doctor5-1.mp4`,
      `${R2_VIDEO_BASE}/doctor5-2.mp4`,
      `${R2_VIDEO_BASE}/doctor5-3.mp4`,
    ],
  },

  {
    id: "doctor6",
    name: "Dr. HUSSAIN LAB",
    specialty: "Dental Specialist",
    image: "/doctor6.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Dental specialist working with modern dental techniques and advanced treatments.",
    videos: [
      `${R2_VIDEO_BASE}/doctor6-1.mp4`,
      `${R2_VIDEO_BASE}/doctor6-2.mp4`,
      `${R2_VIDEO_BASE}/doctor6-3.mp4`,
`${R2_VIDEO_BASE}/doctor6-4.mp4`,
      `${R2_VIDEO_BASE}/doctor6-5.mp4`,
      `${R2_VIDEO_BASE}/doctor6-6.mp4`,

    ],
  },

  {
    id: "doctor7",
    name: "DR AHMMED",
    specialty: "Aesthetic Dentistry",
    image: "/doctor7.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry and creating natural, confident smiles.",
    videos: [
      `${R2_VIDEO_BASE}/doctor7-1.mp4`,
      `${R2_VIDEO_BASE}/doctor7-2.mp4`,
      `${R2_VIDEO_BASE}/doctor7-3.mp4`,
    ],
},
{
    id: "doctor8",
    name: "DR MARRAB",
    specialty: "Aesthetic Dentistry",
    image: "/docto8.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry and creating natural, confident smiles.",
    videos: [
      `${R2_VIDEO_BASE}/doctor8-1.mp4`,
      `${R2_VIDEO_BASE}/doctor8-2.mp4`,
      `${R2_VIDEO_BASE}/doctor8-3.mp4`,
    ],
},
{
    id: "doctor9",
    name: "DR AYSAR",
    specialty: "Aesthetic Dentistry",
    image: "/doctor9.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry and creating natural, confident smiles.",
    videos: [
      `${R2_VIDEO_BASE}/doctor9-1.mp4`,
      `${R2_VIDEO_BASE}/doctor9-2.mp4`,
      `${R2_VIDEO_BASE}/doctor9-3.mp4`,
    ],

  },
{
    id: "doctor10",
    name: "DR BASMMA",
    specialty: "Aesthetic Dentistry",
    image: "/doctor10.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry and creating natural, confident smiles.",
    videos: [
      `${R2_VIDEO_BASE}/doctor10-1mp4`,
     `${R2_VIDEO_BASE}/doctor10-2mp4`,
`${R2_VIDEO_BASE}/doctor10-3mp4`,
    ],
 },
{
    id: "doctor11",
    name: "DR SANNA",
    specialty: "Aesthetic Dentistry",
    image: "/doctor11.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry and creating natural, confident smiles.",
    videos: [
      `${R2_VIDEO_BASE}/doctor11-1.mp4`,
      `${R2_VIDEO_BASE}/doctor11-2.mp4`,
      `${R2_VIDEO_BASE}/doctor11-3.mp4`,
    ],
 },
{
    id: "doctor12",
    name: "DR MARYAM",
    specialty: "Aesthetic Dentistry",
    image: "/doctor12.PNG",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in aesthetic dentistry and creating natural, confident smiles.",
    videos: [
      `${R2_VIDEO_BASE}/doctor12-1.mp4`,
      `${R2_VIDEO_BASE}/doctor12-2.MP4`,
      `${R2_VIDEO_BASE}/doctor12-3.MP4`,
    ],
 },

];

export default function DoctorPage() {
  const params = useParams();
  const router = useRouter();

  const [doctor, setDoctor] =
    useState<Doctor | null>(
      null
    );

  const [cases, setCases] =
    useState<DoctorCase[]>([]);

  const [legacyVideos, setLegacyVideos] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     URL ID / SLUG
  ===================================================== */

  const doctorIdentifier =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const isPortfolioDoctor =
    legacyDoctors.some(
      (item) =>
        item.id === doctorIdentifier
    );

  /* =====================================================
     MOUSE MOVEMENT
  ===================================================== */

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    let animationFrame = 0;

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      targetX =
        (event.clientX /
          window.innerWidth -
          0.5) *
        2;

      targetY =
        (event.clientY /
          window.innerHeight -
          0.5) *
        2;
    };

    const animate = () => {
      currentX +=
        (targetX - currentX) *
        0.035;

      currentY +=
        (targetY - currentY) *
        0.035;

      document.documentElement.style.setProperty(
        "--mouse-x",
        `${currentX}`
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${currentY}`
      );

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  /* =====================================================
     LOAD DOCTOR
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadDoctor() {
      if (!doctorIdentifier) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const legacyDoctor =
        legacyDoctors.find(
          (item) =>
            item.id === doctorIdentifier
        );

      if (legacyDoctor) {
        setDoctor({
          id: legacyDoctor.id,
          full_name: legacyDoctor.name,
          specialty: legacyDoctor.specialty,
          sub_specialty: null,
          bio: legacyDoctor.bio,
          phone: legacyDoctor.phone,
          whatsapp_number: null,
          clinic_name: null,
          clinic_address: legacyDoctor.location,
          profile_image: legacyDoctor.image,
          certificates: null,
          slug: legacyDoctor.id,
          subscription_active: true,
          subscription_expires_at:
            "2999-12-31T23:59:59.000Z",
          is_approved: true,
        });

        setCases([]);
        setLegacyVideos(
          legacyDoctor.videos
        );
        setLoading(false);
        return;
      }

      setLegacyVideos([]);

      try {
        /*
         * نحاول أولاً البحث بالـ slug.
         */

        let {
          data: doctorData,
          error: slugError,
        } = await supabase
          .from("doctors")
          .select(
            `
            id,
            full_name,
            specialty,
            sub_specialty,
            bio,
            phone,
            whatsapp_number,
            clinic_name,
            clinic_address,
            profile_image,
            certificates,
            slug,
            subscription_active,
            subscription_expires_at,
            is_approved
            `
          )
          .eq(
            "slug",
            doctorIdentifier
          )
          .maybeSingle();

        if (slugError) {
          throw slugError;
        }

        /*
         * إذا ما لقيناه بالـ slug،
         * نحاول بالـ UUID.
         */

        if (!doctorData) {
          const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              doctorIdentifier
            );

          if (isUuid) {
            const {
              data: idData,
              error: idError,
            } = await supabase
              .from("doctors")
              .select(
                `
                id,
                full_name,
                specialty,
                sub_specialty,
                bio,
                phone,
                whatsapp_number,
                clinic_name,
                clinic_address,
                profile_image,
                certificates,
                slug,
                subscription_active,
                subscription_expires_at,
                is_approved
                `
              )
              .eq(
                "id",
                doctorIdentifier
              )
              .maybeSingle();

            if (idError) {
              throw idError;
            }

            doctorData = idData;
          }
        }

        if (!doctorData) {
          if (mounted) {
            setDoctor(null);
            setLoading(false);
          }

          return;
        }

        /*
         * لا نظهر الطبيب إذا الاشتراك
         * غير فعال أو منتهي.
         */

        const expiry =
          doctorData
            .subscription_expires_at
            ? new Date(
                doctorData.subscription_expires_at
              )
            : null;

        const subscriptionValid =
          doctorData.subscription_active ===
            true &&
          expiry !== null &&
          expiry.getTime() >
            Date.now();

        if (!subscriptionValid) {
          if (mounted) {
            setDoctor(null);

            setError(
              "اشتراك هذا الطبيب غير فعال حالياً."
            );

            setLoading(false);
          }

          return;
        }

        if (mounted) {
          setDoctor(
            doctorData as Doctor
          );
        }

        /* =================================================
           LOAD CASES
        ================================================= */

        const {
          data: casesData,
          error: casesError,
        } = await supabase
          .from("doctor_cases")
          .select("*")
          .eq(
            "doctor_id",
            doctorData.id
          )
          .eq(
            "is_published",
            true
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (casesError) {
          console.error(
            "LOAD CASES:",
            casesError
          );
        }

        if (
          mounted &&
          casesData
        ) {
          setCases(
            casesData as DoctorCase[]
          );
        }
      } catch (err) {
        const readableError =
          err &&
          typeof err === "object" &&
          "message" in err
            ? String(
                (err as { message?: unknown }).message ||
                  "تعذر تحميل الطبيب."
              )
            : err instanceof Error
              ? err.message
              : "تعذر تحميل الطبيب.";

        if (mounted) {
          setError(readableError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDoctor();

    return () => {
      mounted = false;
    };
  }, [doctorIdentifier]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main
        className={styles.page}
      >
        <div
          className={
            styles.notFound
          }
        >
          <span>
            DOCTOR PROFILE
          </span>

          <h1>
            Loading...
          </h1>
        </div>
      </main>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!doctor) {
    return (
      <main
        className={styles.page}
      >
        <div
          className={
            styles.cyberBackground
          }
          aria-hidden="true"
        >
          <div
            className={
              styles.cyberImage
            }
          />

          <div
            className={
              styles.cyberDark
            }
          />

          <div
            className={`${styles.cyberBlueGlow} ${styles.glowOne}`}
          />

          <div
            className={`${styles.cyberBlueGlow} ${styles.glowTwo}`}
          />

          <div
            className={`${styles.cyberPurpleGlow} ${styles.glowThree}`}
          />

          <div
            className={
              styles.cyberGrid
            }
          />

          <div
            className={
              styles.cyberScanline
            }
          />

          <div
            className={
              styles.cyberParticles
            }
          >
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

        <div
          className={
            styles.notFound
          }
        >
          <span>
            DOCTOR PROFILE
          </span>

          <h1>
            Doctor not found
          </h1>

          {error && (
            <p>{error}</p>
          )}

        </div>
      </main>
    );
  }

  /* =====================================================
     VALUES
  ===================================================== */

  const doctorName =
    doctor.full_name ||
    "Doctor";

  const specialty =
    doctor.sub_specialty ||
    doctor.specialty ||
    "Dental Specialist";

  const image =
    doctor.profile_image ||
    "/logo.png";

  const location =
    doctor.clinic_address ||
    doctor.clinic_name ||
    "Iraq";

  const phone =
    doctor.whatsapp_number ||
    doctor.phone ||
    "";

  const bio =
    doctor.bio ||
    "لم تتم إضافة نبذة مهنية بعد.";

  const certificates =
    !isPortfolioDoctor &&
    Array.isArray(doctor.certificates)
      ? doctor.certificates.filter(Boolean)
      : [];

  function normalizeWhatsAppNumber(
    raw: string
  ) {
    let value =
      raw.replace(/\D/g, "");

    if (value.startsWith("00")) {
      value = value.substring(2);
    }

    if (value.startsWith("0")) {
      value =
        "964" + value.substring(1);
    } else if (!value.startsWith("964")) {
      value =
        "964" + value;
    }

    return value;
  }

  function openWhatsApp() {
    if (!doctor) return;

    const raw =
      isPortfolioDoctor
        ? "07803447144"
        : doctor.whatsapp_number ||
          doctor.phone;

    if (!raw) return;

    const whatsappNumber =
      normalizeWhatsAppNumber(raw);

    const text =
      isPortfolioDoctor
        ? `مرحباً ADAM DESIGN، شفت تصميم ${doctorName} وأريد تصميم/محتوى مشابه لهذا الشغل.`
        : `مرحباً د. ${doctorName}، أريد الاستفسار عن خدماتك.`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        text
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /*
   * إذا عندك video_url داخل doctor_cases
   * راح تظهر الفيديوهات هنا.
   */

  const videos =
    legacyVideos.length > 0
      ? legacyVideos
      : cases
          .map(
            (item) =>
              item.video_url
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          );

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main
      className={styles.page}
    >
      {/* BACKGROUND */}

      <div
        className={
          styles.cyberBackground
        }
        aria-hidden="true"
      >
        <div
          className={
            styles.cyberImage
          }
        />

        <div
          className={
            styles.cyberDark
          }
        />

        <div
          className={`${styles.cyberBlueGlow} ${styles.glowOne}`}
        />

        <div
          className={`${styles.cyberBlueGlow} ${styles.glowTwo}`}
        />

        <div
          className={`${styles.cyberPurpleGlow} ${styles.glowThree}`}
        />

        <div
          className={
            styles.cyberGrid
          }
        />

        <div
          className={
            styles.cyberScanline
          }
        />

        <div
          className={
            styles.cyberParticles
          }
        >
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

      {/* NAV */}

      <header
        className={styles.nav}
      >
        {isPortfolioDoctor && (
          <button
            className={
              styles.backButton
            }
            onClick={() =>
              router.push("/")
            }
            type="button"
          >
            ← BACK TO TEAM
          </button>
        )}

        <div
          className={styles.logo}
        >
          DENTAL{" "}
          <span>MOTION</span>
        </div>

        <div
          className={
            styles.navNumber
          }
        >
          DM
        </div>
      </header>

      {/* DOCTOR */}

      <section
        className={
          styles.heading
        }
      >
        <div
          className={
            styles.doctorProfile
          }
        >
          <div
            className={
              styles.doctorPhoto
            }
          >
            <img
              src={image}
              alt={doctorName}
              className={
                styles.doctorPhotoImage
              }
            />
          </div>

          <div
            className={
              styles.doctorInfo
            }
          >
            <span
              className={
                styles.eyebrow
              }
            >
              {specialty}
            </span>

            <h1>
              {doctorName}
            </h1>

            {!isPortfolioDoctor && (
              <p>
                صفحة الطبيب الرسمية على ADAM DESIGN
              </p>
            )}

            {isPortfolioDoctor && (
              <p>{bio}</p>
            )}

            {doctor.clinic_name && (
              <p>
                🦷{" "}
                {doctor.clinic_name}
              </p>
            )}

            {doctor.clinic_address && (
              <p>
                📍 {doctor.clinic_address}
              </p>
            )}

            {!doctor.clinic_address &&
              location && (
                <p>
                  📍 {location}
                </p>
              )}

            {!isPortfolioDoctor &&
              phone && (
                <p>
                  ☎ {phone}
                </p>
              )}

            {isPortfolioDoctor && (
              <div
                style={{
                  marginTop: 12,
                  padding: "14px 16px",
                  background:
                    "rgba(37,211,102,.06)",
                  border:
                    "1px solid rgba(37,211,102,.2)",
                  maxWidth: 460,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: 7,
                    color: "#fff",
                  }}
                >
                  عجبك هذا الشغل؟
                </strong>

                <span
                  style={{
                    display: "block",
                    color:
                      "rgba(255,255,255,.55)",
                    fontSize: 11,
                    lineHeight: 1.8,
                  }}
                >
                  إذا تريد تصميم أو محتوى مشابه لهذا لطبيبك أو عيادتك،
                  تواصل مباشرة ويا ADAM DESIGN على WhatsApp.
                </span>
              </div>
            )}

            {(isPortfolioDoctor ||
              doctor.whatsapp_number ||
              doctor.phone) && (
              <button
                type="button"
                onClick={
                  openWhatsApp
                }
                style={{
                  marginTop: 12,
                  padding:
                    "12px 18px",
                  background:
                    "#25D366",
                  color: "#fff",
                  border: 0,
                  cursor:
                    "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {isPortfolioDoctor
                  ? "أريد تصميم مثل هذا — WhatsApp"
                  : "تواصل عبر WhatsApp"}
              </button>
            )}

            <p
              style={{
                marginTop: 18,
              }}
            >
              Selected work
              &amp; treatments
            </p>
          </div>
        </div>

        <div
          className={styles.line}
        />
      </section>

      {!isPortfolioDoctor && (
        <section
          dir="rtl"
          style={{
            maxWidth: 1180,
            margin: "0 auto 42px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                certificates.length > 0
                  ? "minmax(0,1fr) minmax(0,1fr)"
                  : "1fr",
              gap: 22,
            }}
          >
            <div
              style={{
                padding: 24,
                background: "rgba(0,10,20,.45)",
                border: "1px solid rgba(0,140,255,.18)",
              }}
            >
              <span
                style={{
                  color: "#32baff",
                  fontSize: 10,
                  letterSpacing: ".12em",
                }}
              >
                ABOUT
              </span>

              <h2
                style={{
                  margin: "8px 0 14px",
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: 500,
                }}
              >
                نبذة عني
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,.68)",
                  lineHeight: 2,
                  whiteSpace: "pre-wrap",
                }}
              >
                {bio}
              </p>
            </div>

            {certificates.length > 0 && (
              <div
                style={{
                  padding: 24,
                  background: "rgba(0,10,20,.45)",
                  border: "1px solid rgba(199,168,93,.2)",
                }}
              >
                <span
                  style={{
                    color: "#c7a85d",
                    fontSize: 10,
                    letterSpacing: ".12em",
                  }}
                >
                  CERTIFICATES
                </span>

                <h2
                  style={{
                    margin: "8px 0 14px",
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: 500,
                  }}
                >
                  الشهادات والمؤهلات
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 12,
                  }}
                >
                  {certificates.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "block",
                        textDecoration: "none",
                      }}
                    >
                      <img
                        src={url}
                        alt={`شهادة ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 190,
                          objectFit: "contain",
                          display: "block",
                          background: "#05080d",
                          border:
                            "1px solid rgba(255,255,255,.08)",
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* WORK */}

      <section
        className={
          styles.workSection
        }
      >
        <div
          className={
            styles.workHeader
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              SELECTED WORK
            </span>

            <h2>
              Cases
              <br />

              <em>
                &amp; treatments.
              </em>
            </h2>
          </div>

          <p>
            Selected dental
            cases
            <br />
            and treatments.
          </p>
        </div>

        {/* VIDEOS */}

        {videos.length > 0 && (
          <div
            className={`${styles.videosList} mobileVideosScroller`}
          >
            {videos.map(
              (
                video,
                index
              ) => (
                <VideoCard
                  key={`${video}-${index}`}
                  video={video}
                  number={
                    index + 1
                  }
                />
              )
            )}
          </div>
        )}

        {/* BEFORE / AFTER */}

        {cases.length > 0 && (
          <div
            className="mobileCasesScroller"
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",

              gap: "24px",

              marginTop:
                "40px",
            }}
          >
            {cases.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className="mobileCaseCard"
                  style={{
                    border:
                      "1px solid rgba(0,140,255,.18)",

                    padding:
                      "16px",

                    background:
                      "rgba(0,10,20,.45)",
                  }}
                >
                  {item.title && (
                    <h3>
                      {
                        item.title
                      }
                    </h3>
                  )}

                  {item.description && (
                    <p>
                      {
                        item.description
                      }
                    </p>
                  )}

                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "1fr 1fr",

                      gap:
                        "10px",
                    }}
                  >
                    {item.before_image && (
                      <div>
                        <small>
                          BEFORE
                        </small>

                        <img
                          src={
                            item.before_image
                          }
                          alt="Before"
                          loading="lazy"
                          decoding="async"
                          style={{
                            width:
                              "100%",
                            height:
                              "320px",
                            objectFit:
                              "contain",
                            marginTop:
                              "8px",
                            display:
                              "block",
                            background:
                              "#05080d",
                          }}
                        />
                      </div>
                    )}

                    {item.after_image && (
                      <div>
                        <small>
                          AFTER
                        </small>

                        <img
                          src={
                            item.after_image
                          }
                          alt="After"
                          loading="lazy"
                          decoding="async"
                          style={{
                            width:
                              "100%",
                            height:
                              "320px",
                            objectFit:
                              "contain",
                            marginTop:
                              "8px",
                            display:
                              "block",
                            background:
                              "#05080d",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {cases.length === 0 && (
          <p
            style={{
              marginTop:
                "40px",

              opacity: 0.55,
            }}
          >
            لا توجد حالات منشورة
            حالياً.
          </p>
        )}
      </section>

      {/* FOOTER */}

      <footer
        className={
          styles.footer
        }
      >
        <div>
          <span
            className={
              styles.footerLabel
            }
          >
            DENTAL MOTION
          </span>

          <h2>
            Every smile
            <br />
            tells a story.
          </h2>
        </div>

        {isPortfolioDoctor && (
          <button
            className={
              styles.footerButton
            }
            onClick={() =>
              router.push("/")
            }
            type="button"
          >
            BACK TO TEAM
          </button>
        )}
      </footer>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobileVideosScroller {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 82vw !important;
            grid-template-columns: none !important;
            gap: 14px !important;

            width: calc(100vw - 24px) !important;
            margin-left: calc(50% - 50vw + 12px) !important;
            margin-right: calc(50% - 50vw + 12px) !important;
            padding: 0 12px 14px !important;

            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-inline: 12px !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-inline: contain;
            scrollbar-width: none;
          }

          .mobileVideosScroller::-webkit-scrollbar {
            display: none;
          }

          .mobileVideosScroller > article {
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            aspect-ratio: 9 / 16 !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .mobileVideosScroller > article video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }

          /* حالات الطبيب بالموبايل: نفس فكرة البطاقات الأفقية */
          .mobileCasesScroller {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 82vw !important;
            grid-template-columns: none !important;
            gap: 14px !important;

            width: calc(100vw - 24px) !important;
            margin-left: calc(50% - 50vw + 12px) !important;
            margin-right: calc(50% - 50vw + 12px) !important;
            padding: 0 12px 14px !important;

            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-inline: 12px !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-inline: contain;
            scrollbar-width: none;
          }

          .mobileCasesScroller::-webkit-scrollbar {
            display: none;
          }

          .mobileCasesScroller > .mobileCaseCard {
            width: 100% !important;
            min-width: 0 !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .mobileCaseCard img {
            height: 250px !important;
            object-fit: contain !important;
          }
        }

        @media (max-width: 430px) {
          .mobileVideosScroller,
          .mobileCasesScroller {
            grid-auto-columns: 86vw !important;
          }

          .mobileCaseCard img {
            height: 220px !important;
          }

          .mobileVideosScroller > article {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            aspect-ratio: 9 / 16 !important;
          }
        }
      `}</style>
    </main>
  );
}