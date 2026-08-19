"use client";

import {
  FormEvent,
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

type PatientReview = {
  id: string;
  doctor_id: string;
  patient_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
};

type SiteTheme =
  | "dark-blue"
  | "black-gold"
  | "clean-white";

type FaqItem = {
  question: string;
  answer: string;
};

type OfferItem = {
  id: string;
  title: string;
  description: string;
  expires_at: string;
};

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
  services: string[] | null;
  site_theme: SiteTheme | null;
  google_maps_url: string | null;
  clinic_days: string | null;
  clinic_hours_from: string | null;
  clinic_hours_to: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  faq_items: FaqItem[] | null;
  clinic_logo: string | null;
  cover_image: string | null;
  offers: OfferItem[] | null;
  subscription_plan: string | null;
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
  category?: string | null;
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


function BeforeAfterSlider({
  before,
  after,
  title,
}: {
  before?: string | null;
  after?: string | null;
  title?: string | null;
}) {
  const [position, setPosition] =
    useState(50);

  if (!before && !after) {
    return null;
  }

  if (!before || !after) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 280,
          background: "#05080d",
          overflow: "hidden",
        }}
      >
        <img
          src={before || after || ""}
          alt={title || "Dental case"}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: 320,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="beforeAfterSlider"
      style={{
        position: "relative",
        width: "100%",
        height: 340,
        overflow: "hidden",
        background: "#05080d",
        touchAction: "pan-y",
        userSelect: "none",
      }}
    >
      <img
        src={after}
        alt={`${title || "Dental case"} after`}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />

      <img
        src={before}
        alt={`${title || "Dental case"} before`}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          clipPath: `inset(0 ${
            100 - position
          }% 0 0)`,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${position}%`,
          width: 2,
          transform: "translateX(-1px)",
          background: "#fff",
          boxShadow:
            "0 0 18px rgba(0,0,0,.45)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform:
              "translate(-50%,-50%)",
            width: 42,
            height: 42,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#03101b",
            background: "#fff",
            fontWeight: 900,
            fontSize: 14,
          }}
        >
          ↔
        </div>
      </div>

      <span
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 3,
          padding: "6px 9px",
          background:
            "rgba(0,0,0,.62)",
          color: "#fff",
          fontSize: 9,
          letterSpacing: ".12em",
          pointerEvents: "none",
        }}
      >
        BEFORE
      </span>

      <span
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 3,
          padding: "6px 9px",
          background:
            "rgba(0,0,0,.62)",
          color: "#fff",
          fontSize: 9,
          letterSpacing: ".12em",
          pointerEvents: "none",
        }}
      >
        AFTER
      </span>

      <input
        aria-label="اسحب للمقارنة بين قبل وبعد"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) =>
          setPosition(
            Number(e.target.value)
          )
        }
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          margin: 0,
          opacity: 0,
          cursor: "ew-resize",
          zIndex: 4,
        }}
      />
    </div>
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

  const [patientReviews, setPatientReviews] =
    useState<PatientReview[]>([]);
  const [reviewName, setReviewName] =
    useState("");
  const [reviewText, setReviewText] =
    useState("");
  const [reviewRating, setReviewRating] =
    useState(5);
  const [reviewSending, setReviewSending] =
    useState(false);
  const [reviewMessage, setReviewMessage] =
    useState("");
  const [reviewError, setReviewError] =
    useState("");
  const [reviewWebsite, setReviewWebsite] =
    useState("");

  const [appointmentName, setAppointmentName] =
    useState("");
  const [appointmentService, setAppointmentService] =
    useState("");
  const [appointmentDay, setAppointmentDay] =
    useState("");
  const [appointmentTime, setAppointmentTime] =
    useState("");
  const [appointmentNote, setAppointmentNote] =
    useState("");
  const [appointmentError, setAppointmentError] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");
  const [caseCategoryFilter, setCaseCategoryFilter] =
    useState("الكل");
  const [doctorSaved, setDoctorSaved] =
    useState(false);
  const [utilityMessage, setUtilityMessage] =
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
          services: null,
          site_theme: null,
          google_maps_url: null,
          clinic_days: null,
          clinic_hours_from: null,
          clinic_hours_to: null,
          instagram_url: null,
          tiktok_url: null,
          facebook_url: null,
          faq_items: null,
          clinic_logo: null,
          cover_image: null,
          offers: null,
          subscription_plan: null,
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
            services,
            site_theme,
            google_maps_url,
            clinic_days,
            clinic_hours_from,
            clinic_hours_to,
            instagram_url,
            tiktok_url,
            facebook_url,
            faq_items,
            clinic_logo,
            cover_image,
            offers,
            subscription_plan,
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
                services,
                site_theme,
                google_maps_url,
                clinic_days,
                clinic_hours_from,
                clinic_hours_to,
                instagram_url,
                tiktok_url,
                facebook_url,
                faq_items,
                clinic_logo,
                cover_image,
                offers,
                subscription_plan,
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

  useEffect(() => {
    if (
      !doctor ||
      isPortfolioDoctor ||
      typeof window === "undefined"
    ) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          "saved-doctors"
        );

      const saved =
        raw
          ? JSON.parse(raw)
          : [];

      setDoctorSaved(
        Array.isArray(saved) &&
          saved.some(
            (item: {
              id?: string;
            }) =>
              item.id === doctor.id
          )
      );
    } catch {
      setDoctorSaved(false);
    }
  }, [
    doctor,
    isPortfolioDoctor,
  ]);

  /* =====================================================
     LOAD APPROVED REVIEWS
     لازم يكون الـ Hook قبل أي return شرطي
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadApprovedReviews() {
      if (
        !doctor ||
        isPortfolioDoctor ||
        (
          doctor.subscription_plan ||
          ""
        ).toLowerCase() !== "premium"
      ) {
        if (mounted) {
          setPatientReviews([]);
        }
        return;
      }

      const {
        data,
        error: reviewsError,
      } = await supabase
        .from("doctor_reviews")
        .select(
          "id, doctor_id, patient_name, rating, review_text, is_approved, created_at"
        )
        .eq(
          "doctor_id",
          doctor.id
        )
        .eq(
          "is_approved",
          true
        )
        .order(
          "approved_at",
          {
            ascending: false,
          }
        )
        .limit(20);

      if (!mounted) return;

      if (reviewsError) {
        console.error(
          "LOAD REVIEWS:",
          reviewsError
        );
        setPatientReviews([]);
      } else {
        setPatientReviews(
          (data || []) as PatientReview[]
        );
      }
    }

    loadApprovedReviews();

    return () => {
      mounted = false;
    };
  }, [
    doctor?.id,
    doctor?.subscription_plan,
    isPortfolioDoctor,
  ]);

  /* =====================================================
     SIMPLE ANALYTICS
     يسجل زيارة واحدة لكل طبيب داخل نفس تبويب/جلسة المتصفح.
  ===================================================== */

  useEffect(() => {
    if (
      !doctor ||
      isPortfolioDoctor
    ) {
      return;
    }

    const key =
      `doctor-view-counted-${doctor.id}`;

    try {
      if (
        sessionStorage.getItem(key)
      ) {
        return;
      }

      sessionStorage.setItem(
        key,
        "1"
      );

      void supabase.rpc(
        "increment_doctor_stat",
        {
          p_doctor_id:
            doctor.id,
          p_stat: "view",
        }
      );
    } catch {
      void supabase.rpc(
        "increment_doctor_stat",
        {
          p_doctor_id:
            doctor.id,
          p_stat: "view",
        }
      );
    }
  }, [
    doctor?.id,
    isPortfolioDoctor,
  ]);

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
          className={`${styles.cyberBackground} doctorThemeBackground`}
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

  const isPremium =
    !isPortfolioDoctor &&
    (
      doctor.subscription_plan ||
      ""
    ).toLowerCase() === "premium";

  const siteTheme: SiteTheme =
    isPremium &&
    (
      doctor.site_theme ===
        "black-gold" ||
      doctor.site_theme ===
        "clean-white"
    )
      ? doctor.site_theme
      : "dark-blue";

  const themePalette =
    siteTheme === "black-gold"
      ? {
          background: "#070604",
          surface:
            "rgba(18,14,8,.86)",
          surfaceSoft:
            "rgba(214,180,94,.055)",
          accent: "#d6b45e",
          border:
            "rgba(214,180,94,.20)",
          text: "#ffffff",
          muted:
            "rgba(255,255,255,.56)",
        }
      : siteTheme ===
          "clean-white"
        ? {
            background: "#f3f6f8",
            surface:
              "rgba(255,255,255,.96)",
            surfaceSoft:
              "rgba(16,119,167,.045)",
            accent: "#1677a7",
            border:
              "rgba(17,88,120,.15)",
            text: "#0c1720",
            muted:
              "rgba(12,23,32,.58)",
          }
        : {
            background: "#02070e",
            surface:
              "rgba(0,10,20,.72)",
            surfaceSoft:
              "rgba(50,186,255,.045)",
            accent: "#32baff",
            border:
              "rgba(50,186,255,.18)",
            text: "#ffffff",
            muted:
              "rgba(255,255,255,.58)",
          };

  function normalizeExternalUrl(
    value: string | null
  ) {
    const raw =
      value?.trim();

    if (!raw) return "";

    const candidate =
      /^https?:\/\//i.test(raw)
        ? raw
        : `https://${raw}`;

    try {
      const parsed =
        new URL(candidate);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        return "";
      }

      return parsed.toString();
    } catch {
      return "";
    }
  }

  const googleMapsUrl =
    normalizeExternalUrl(
      doctor.google_maps_url
    );
  const instagramUrl =
    normalizeExternalUrl(
      doctor.instagram_url
    );
  const tiktokUrl =
    normalizeExternalUrl(
      doctor.tiktok_url
    );
  const facebookUrl =
    normalizeExternalUrl(
      doctor.facebook_url
    );

  const hasClinicExtras =
    Boolean(
      googleMapsUrl ||
        doctor.clinic_days ||
        doctor.clinic_hours_from ||
        doctor.clinic_hours_to ||
        instagramUrl ||
        tiktokUrl ||
        facebookUrl
    );

  const services =
    isPremium &&
    Array.isArray(doctor.services)
      ? doctor.services.filter(
          (item): item is string =>
            typeof item === "string" &&
            item.trim().length > 0
        )
      : [];

  const faqItems =
    !isPortfolioDoctor &&
    Array.isArray(doctor.faq_items)
      ? doctor.faq_items
          .filter(
            (item): item is FaqItem =>
              Boolean(
                item &&
                  typeof item.question === "string" &&
                  typeof item.answer === "string" &&
                  item.question.trim() &&
                  item.answer.trim()
              )
          )
          .slice(0, 10)
      : [];

  const activeOffers =
    !isPortfolioDoctor &&
    Array.isArray(doctor.offers)
      ? doctor.offers
          .filter(
            (item): item is OfferItem =>
              Boolean(
                item &&
                  typeof item.title === "string" &&
                  typeof item.expires_at === "string" &&
                  new Date(
                    item.expires_at
                  ).getTime() >
                    Date.now()
              )
          )
          .slice(0, 10)
      : [];

  const caseCategories = [
    "الكل",
    ...Array.from(
      new Set(
        cases.map(
          (item) =>
            item.category?.trim() ||
            "عام"
        )
      )
    ),
  ];

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredCases =
    cases.filter(
      (item) => {
        const category =
          item.category?.trim() ||
          "عام";

        const categoryMatch =
          caseCategoryFilter ===
            "الكل" ||
          category ===
            caseCategoryFilter;

        const searchMatch =
          !normalizedSearch ||
          [
            item.title,
            item.description,
            category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        return (
          categoryMatch &&
          searchMatch
        );
      }
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

  const reviewsAverage =
    patientReviews.length > 0
      ? (
          patientReviews.reduce(
            (sum, item) =>
              sum + item.rating,
            0
          ) / patientReviews.length
        ).toFixed(1)
      : "0.0";

  const structuredDoctorData =
    !isPortfolioDoctor
      ? {
          "@context":
            "https://schema.org",
          "@type":
            "Dentist",
          name:
            doctorName,
          image:
            doctor.profile_image ||
            doctor.clinic_logo ||
            undefined,
          description:
            bio,
          telephone:
            phone || undefined,
          address:
            doctor.clinic_address
              ? {
                  "@type":
                    "PostalAddress",
                  streetAddress:
                    doctor.clinic_address,
                }
              : undefined,
          medicalSpecialty:
            specialty,
          url:
            `https://adam-designe.netlify.app/doctor/${
              doctor.slug ||
              doctor.id
            }`,
          sameAs: [
            instagramUrl,
            tiktokUrl,
            facebookUrl,
          ].filter(Boolean),
          hasOfferCatalog:
            services.length > 0
              ? {
                  "@type":
                    "OfferCatalog",
                  name:
                    "Dental Services",
                  itemListElement:
                    services.map(
                      (service) => ({
                        "@type":
                          "Offer",
                        itemOffered:
                          {
                            "@type":
                              "Service",
                            name:
                              service,
                          },
                      })
                    ),
                }
              : undefined,
        }
      : null;

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

  function trackDoctorEvent(
    eventName: string,
    key?: string
  ) {
    if (
      !doctor ||
      isPortfolioDoctor
    ) {
      return;
    }

    void supabase.rpc(
      "increment_doctor_event",
      {
        p_doctor_id:
          doctor.id,
        p_event:
          eventName,
        p_key:
          key || null,
      }
    );
  }

  function scrollToTrackedSection(
    id: string,
    label: string
  ) {
    trackDoctorEvent(
      "section",
      label
    );

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  async function shareDoctorProfile() {
    if (
      !doctor ||
      isPortfolioDoctor ||
      typeof window === "undefined"
    ) {
      return;
    }

    const url =
      window.location.href;

    trackDoctorEvent(
      "share"
    );

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            `د. ${doctorName}`,
          text:
            `موقع د. ${doctorName} — ${specialty}`,
          url,
        });
        setUtilityMessage(
          "تمت مشاركة الموقع."
        );
      } else {
        await navigator.clipboard.writeText(
          url
        );
        setUtilityMessage(
          "تم نسخ رابط الطبيب."
        );
      }
    } catch {
      // المستخدم قد يغلق نافذة المشاركة.
    }
  }

  async function copyClinicAddress() {
    const clinicAddress =
      doctor?.clinic_address;

    if (!clinicAddress) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        clinicAddress
      );

      trackDoctorEvent(
        "address"
      );

      setUtilityMessage(
        "تم نسخ عنوان العيادة."
      );
    } catch {
      setUtilityMessage(
        "تعذر نسخ العنوان."
      );
    }
  }

  function callDoctor() {
    if (!doctor) {
      return;
    }

    const raw =
      doctor.phone ||
      doctor.whatsapp_number;

    if (!raw) return;

    trackDoctorEvent(
      "phone"
    );

    window.location.href =
      `tel:${raw}`;
  }

  function toggleSavedDoctor() {
    if (
      !doctor ||
      isPortfolioDoctor ||
      typeof window === "undefined"
    ) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          "saved-doctors"
        );

      const saved =
        raw
          ? JSON.parse(raw)
          : [];

      const list =
        Array.isArray(saved)
          ? saved
          : [];

      const exists =
        list.some(
          (item: {
            id?: string;
          }) =>
            item.id === doctor.id
        );

      const next =
        exists
          ? list.filter(
              (item: {
                id?: string;
              }) =>
                item.id !== doctor.id
            )
          : [
              ...list,
              {
                id:
                  doctor.id,
                name:
                  doctorName,
                specialty,
                image,
                url:
                  window.location.href,
              },
            ];

      localStorage.setItem(
        "saved-doctors",
        JSON.stringify(next)
      );

      setDoctorSaved(!exists);
      setUtilityMessage(
        exists
          ? "تمت إزالة الطبيب من المحفوظات."
          : "تم حفظ الطبيب على هذا الجهاز."
      );
    } catch {
      setUtilityMessage(
        "تعذر حفظ الطبيب على هذا الجهاز."
      );
    }
  }

  function requestService(
    service: string
  ) {
    if (
      !doctor ||
      isPortfolioDoctor
    ) {
      return;
    }

    const raw =
      doctor.whatsapp_number ||
      doctor.phone;

    if (!raw) return;

    trackDoctorEvent(
      "service",
      service
    );

    void supabase.rpc(
      "increment_doctor_stat",
      {
        p_doctor_id:
          doctor.id,
        p_stat:
          "whatsapp",
      }
    );

    const whatsappNumber =
      normalizeWhatsAppNumber(raw);

    const text =
      `مرحباً د. ${doctorName}، أريد الاستفسار عن خدمة: ${service}`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        text
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
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

    if (!isPortfolioDoctor) {
      void supabase.rpc(
        "increment_doctor_stat",
        {
          p_doctor_id:
            doctor.id,
          p_stat:
            "whatsapp",
        }
      );
    }

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

  function sendAppointmentRequest(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !doctor ||
      isPortfolioDoctor
    ) {
      return;
    }

    const raw =
      doctor.whatsapp_number ||
      doctor.phone;

    if (!raw) {
      setAppointmentError(
        "الطبيب لم يضف رقم WhatsApp بعد."
      );
      return;
    }

    if (
      appointmentName.trim().length < 2
    ) {
      setAppointmentError(
        "اكتب اسم المريض."
      );
      return;
    }

    if (!appointmentDay.trim()) {
      setAppointmentError(
        "اكتب اليوم المفضل."
      );
      return;
    }

    const whatsappNumber =
      normalizeWhatsAppNumber(raw);

    const selectedService =
      appointmentService.trim() ||
      "استشارة عامة";

    const lines = [
      `مرحباً د. ${doctorName}، أريد طلب موعد.`,
      "",
      `الاسم: ${appointmentName.trim()}`,
      `الخدمة: ${selectedService}`,
      `اليوم المفضل: ${appointmentDay.trim()}`,
      `الوقت المفضل: ${appointmentTime || "غير محدد"}`,
    ];

    if (
      appointmentNote.trim()
    ) {
      lines.push(
        `ملاحظة: ${appointmentNote.trim()}`
      );
    }

    void supabase.rpc(
      "increment_doctor_stat",
      {
        p_doctor_id:
          doctor.id,
        p_stat:
          "whatsapp",
      }
    );

    trackDoctorEvent(
      "appointment"
    );

    setAppointmentError("");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        lines.join("\n")
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function submitPatientReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !doctor ||
      !isPremium
    ) {
      return;
    }

    const name =
      reviewName.trim();
    const text =
      reviewText.trim();

    if (reviewWebsite.trim()) {
      setReviewMessage(
        "شكراً، تم استلام المحاولة."
      );
      return;
    }

    try {
      const cooldownKey =
        `doctor-review-cooldown-${doctor.id}`;

      const lastSent =
        Number(
          localStorage.getItem(
            cooldownKey
          ) || "0"
        );

      if (
        lastSent > 0 &&
        Date.now() - lastSent <
          90_000
      ) {
        setReviewError(
          "انتظر دقيقة ونص قبل إرسال رأي آخر."
        );
        return;
      }
    } catch {
      // حماية قاعدة البيانات تبقى فعالة.
    }

    if (
      name.length < 2 ||
      text.length < 3
    ) {
      setReviewError(
        "اكتب اسمك ورأيك بشكل كامل."
      );
      return;
    }

    if (name.length > 60) {
      setReviewError(
        "الاسم طويل جداً."
      );
      return;
    }

    if (text.length > 700) {
      setReviewError(
        "الرأي يجب أن يكون أقل من 700 حرف."
      );
      return;
    }

    setReviewSending(true);
    setReviewError("");
    setReviewMessage("");

    const { error: insertError } =
      await supabase
        .from("doctor_reviews")
        .insert({
          doctor_id: doctor.id,
          patient_name: name,
          rating: Math.min(
            5,
            Math.max(
              1,
              reviewRating
            )
          ),
          review_text: text,
          is_approved: false,
        });

    if (insertError) {
      console.error(
        "SUBMIT REVIEW:",
        insertError
      );
      setReviewError(
        insertError.message
          .toLowerCase()
          .includes("spam")
          ? "تم إيقاف المحاولة بسبب حماية التقييمات. انتظر وحاول لاحقاً."
          : "تعذر إرسال الرأي حالياً. إذا أرسلت قبل قليل انتظر وحاول مرة أخرى."
      );
    } else {
      try {
        localStorage.setItem(
          `doctor-review-cooldown-${doctor.id}`,
          Date.now().toString()
        );
      } catch {
        // لا شيء
      }

      setReviewName("");
      setReviewText("");
      setReviewRating(5);
      setReviewMessage(
        "شكراً لك. تم إرسال رأيك للطبيب وسيظهر بعد موافقته."
      );
    }

    setReviewSending(false);
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
      className={`${styles.page} doctorThemeRoot`}
      data-site-theme={siteTheme}
      style={{
        background:
          themePalette.background,
        color:
          themePalette.text,
        ["--doctor-accent" as string]:
          themePalette.accent,
        ["--doctor-surface" as string]:
          themePalette.surface,
        ["--doctor-border" as string]:
          themePalette.border,
        ["--doctor-text" as string]:
          themePalette.text,
        ["--doctor-muted" as string]:
          themePalette.muted,
      }}
    >
      {structuredDoctorData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredDoctorData
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      )}

      {/* BACKGROUND */}

      <div
        className={`${styles.cyberBackground} doctorThemeBackground`}
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
        className={`${styles.nav} doctorThemeNav`}
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
        className={`${styles.heading} doctorThemeHeading`}
      >
        {!isPortfolioDoctor &&
          doctor.cover_image && (
          <div
            className="doctorCover"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 1180,
              height: 230,
              margin:
                "0 auto 26px",
              overflow: "hidden",
              border:
                `1px solid ${themePalette.border}`,
              background:
                themePalette.surface,
            }}
          >
            <img
              src={doctor.cover_image}
              alt={`Cover ${doctorName}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  siteTheme ===
                  "clean-white"
                    ? "linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.26))"
                    : "linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.42))",
              }}
            />
          </div>
        )}

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
              <>
                <p>
                  صفحة الطبيب الرسمية على ADAM DESIGN
                </p>

                {isPremium && (
                  <span
                    style={{
                      display:
                        "inline-block",
                      marginTop: 5,
                      padding:
                        "5px 8px",
                      color:
                        themePalette.accent,
                      border:
                        `1px solid ${themePalette.border}`,
                      fontSize: 8,
                      letterSpacing:
                        ".12em",
                    }}
                  >
                    PREMIUM • {
                      siteTheme ===
                      "black-gold"
                        ? "BLACK & GOLD"
                        : siteTheme ===
                          "clean-white"
                        ? "CLEAN WHITE"
                        : "DARK BLUE"
                    }
                  </span>
                )}
              </>
            )}

            {isPortfolioDoctor && (
              <p>{bio}</p>
            )}

            {!isPortfolioDoctor &&
              doctor.clinic_logo && (
              <img
                src={doctor.clinic_logo}
                alt={
                  doctor.clinic_name ||
                  "شعار العيادة"
                }
                style={{
                  width: 74,
                  height: 74,
                  marginTop: 12,
                  objectFit: "contain",
                  borderRadius: "16px",
                  background:
                    themePalette.surfaceSoft,
                  border:
                    `1px solid ${themePalette.border}`,
                }}
              />
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

            {!isPortfolioDoctor && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {(doctor.phone ||
                    doctor.whatsapp_number) && (
                    <button
                      type="button"
                      onClick={callDoctor}
                      style={{
                        padding:
                          "10px 13px",
                        border:
                          `1px solid ${themePalette.border}`,
                        background:
                          themePalette.surfaceSoft,
                        color:
                          themePalette.text,
                        cursor: "pointer",
                        fontSize: 10,
                      }}
                    >
                      ☎ اتصال مباشر
                    </button>
                  )}

                  {doctor.clinic_address && (
                    <button
                      type="button"
                      onClick={
                        copyClinicAddress
                      }
                      style={{
                        padding:
                          "10px 13px",
                        border:
                          `1px solid ${themePalette.border}`,
                        background:
                          themePalette.surfaceSoft,
                        color:
                          themePalette.text,
                        cursor: "pointer",
                        fontSize: 10,
                      }}
                    >
                      📋 نسخ العنوان
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={
                      shareDoctorProfile
                    }
                    style={{
                      padding:
                        "10px 13px",
                      border:
                        `1px solid ${themePalette.border}`,
                      background:
                        themePalette.surfaceSoft,
                      color:
                        themePalette.text,
                      cursor: "pointer",
                      fontSize: 10,
                    }}
                  >
                    ↗ مشاركة الموقع
                  </button>

                  <button
                    type="button"
                    onClick={
                      toggleSavedDoctor
                    }
                    style={{
                      padding:
                        "10px 13px",
                      border:
                        doctorSaved
                          ? `1px solid ${themePalette.accent}`
                          : `1px solid ${themePalette.border}`,
                      background:
                        doctorSaved
                          ? themePalette.surfaceSoft
                          : "transparent",
                      color:
                        doctorSaved
                          ? themePalette.accent
                          : themePalette.text,
                      cursor: "pointer",
                      fontSize: 10,
                    }}
                  >
                    {doctorSaved
                      ? "★ محفوظ"
                      : "☆ احفظ الطبيب"}
                  </button>
                </div>

                {utilityMessage && (
                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      color:
                        themePalette.accent,
                      fontSize: 9,
                    }}
                  >
                    {utilityMessage}
                  </p>
                )}

                <div
                  className="quickSectionNav"
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  {services.length >
                    0 && (
                    <button
                      type="button"
                      onClick={() =>
                        scrollToTrackedSection(
                          "doctor-services",
                          "الخدمات"
                        )
                      }
                      style={{
                        padding:
                          "7px 10px",
                        border:
                          `1px solid ${themePalette.border}`,
                        background:
                          "transparent",
                        color:
                          themePalette.muted,
                        cursor: "pointer",
                        fontSize: 9,
                      }}
                    >
                      الخدمات
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      scrollToTrackedSection(
                        "doctor-cases",
                        "الحالات"
                      )
                    }
                    style={{
                      padding:
                        "7px 10px",
                      border:
                        `1px solid ${themePalette.border}`,
                      background:
                        "transparent",
                      color:
                        themePalette.muted,
                      cursor: "pointer",
                      fontSize: 9,
                    }}
                  >
                    الحالات
                  </button>

                  {isPremium && (
                    <button
                      type="button"
                      onClick={() =>
                        scrollToTrackedSection(
                          "doctor-reviews",
                          "الآراء"
                        )
                      }
                      style={{
                        padding:
                          "7px 10px",
                        border:
                          `1px solid ${themePalette.border}`,
                        background:
                          "transparent",
                        color:
                          themePalette.muted,
                        cursor: "pointer",
                        fontSize: 9,
                      }}
                    >
                      الآراء
                    </button>
                  )}
                </div>
              </>
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

      {!isPortfolioDoctor &&
        hasClinicExtras && (
          <section
            dir="rtl"
            style={{
              maxWidth: 1180,
              margin: "0 auto 22px",
              padding: "0 24px",
            }}
          >
            <div
              className="themeSurface clinicInfoGrid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",
                gap: 1,
                overflow: "hidden",
                background:
                  themePalette.border,
                border:
                  `1px solid ${themePalette.border}`,
              }}
            >
              {(doctor.clinic_days ||
                doctor.clinic_hours_from ||
                doctor.clinic_hours_to) && (
                <div
                  style={{
                    padding: 18,
                    background:
                      themePalette.surface,
                  }}
                >
                  <span
                    style={{
                      color:
                        themePalette.accent,
                      fontSize: 9,
                      letterSpacing:
                        ".14em",
                    }}
                  >
                    WORKING HOURS
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: 7,
                      color:
                        themePalette.text,
                      fontSize: 14,
                    }}
                  >
                    أوقات الدوام
                  </strong>

                  {doctor.clinic_days && (
                    <p
                      style={{
                        margin:
                          "9px 0 3px",
                        color:
                          themePalette.muted,
                        fontSize: 11,
                      }}
                    >
                      {
                        doctor.clinic_days
                      }
                    </p>
                  )}

                  {(doctor.clinic_hours_from ||
                    doctor.clinic_hours_to) && (
                    <p
                      style={{
                        margin: 0,
                        color:
                          themePalette.text,
                        fontSize: 12,
                      }}
                    >
                      {doctor.clinic_hours_from ||
                        "--:--"}
                      {" — "}
                      {doctor.clinic_hours_to ||
                        "--:--"}
                    </p>
                  )}
                </div>
              )}

              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "center",
                    padding: 18,
                    background:
                      themePalette.surface,
                    textDecoration:
                      "none",
                  }}
                >
                  <span
                    style={{
                      color:
                        themePalette.accent,
                      fontSize: 9,
                      letterSpacing:
                        ".14em",
                    }}
                  >
                    LOCATION
                  </span>

                  <strong
                    style={{
                      marginTop: 7,
                      color:
                        themePalette.text,
                      fontSize: 14,
                    }}
                  >
                    📍 موقع العيادة
                  </strong>

                  <span
                    style={{
                      marginTop: 5,
                      color:
                        themePalette.muted,
                      fontSize: 10,
                    }}
                  >
                    فتح Google Maps ↗
                  </span>
                </a>
              )}

              {(instagramUrl ||
                tiktokUrl ||
                facebookUrl) && (
                <div
                  style={{
                    padding: 18,
                    background:
                      themePalette.surface,
                  }}
                >
                  <span
                    style={{
                      color:
                        themePalette.accent,
                      fontSize: 9,
                      letterSpacing:
                        ".14em",
                    }}
                  >
                    SOCIAL
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: 7,
                      color:
                        themePalette.text,
                      fontSize: 14,
                    }}
                  >
                    تابع الطبيب
                  </strong>

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      flexWrap: "wrap",
                      marginTop: 10,
                    }}
                  >
                    {instagramUrl && (
                      <a
                        href={
                          instagramUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding:
                            "7px 9px",
                          color:
                            themePalette.text,
                          textDecoration:
                            "none",
                          fontSize: 10,
                          border:
                            `1px solid ${themePalette.border}`,
                          background:
                            themePalette.surfaceSoft,
                        }}
                      >
                        Instagram
                      </a>
                    )}

                    {tiktokUrl && (
                      <a
                        href={tiktokUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding:
                            "7px 9px",
                          color:
                            themePalette.text,
                          textDecoration:
                            "none",
                          fontSize: 10,
                          border:
                            `1px solid ${themePalette.border}`,
                          background:
                            themePalette.surfaceSoft,
                        }}
                      >
                        TikTok
                      </a>
                    )}

                    {facebookUrl && (
                      <a
                        href={
                          facebookUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding:
                            "7px 9px",
                          color:
                            themePalette.text,
                          textDecoration:
                            "none",
                          fontSize: 10,
                          border:
                            `1px solid ${themePalette.border}`,
                          background:
                            themePalette.surfaceSoft,
                        }}
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      {!isPortfolioDoctor &&
        activeOffers.length > 0 && (
          <section
            dir="rtl"
            style={{
              maxWidth: 1180,
              margin: "0 auto 30px",
              padding: "0 24px",
            }}
          >
            <div
              className="themeSurface"
              style={{
                padding: 24,
                background:
                  themePalette.surface,
                border:
                  `1px solid ${themePalette.border}`,
              }}
            >
              <span
                style={{
                  color: "#ffbf69",
                  fontSize: 9,
                  letterSpacing:
                    ".14em",
                }}
              >
                LIMITED OFFERS
              </span>

              <h2
                style={{
                  margin: "8px 0 16px",
                  color:
                    themePalette.text,
                  fontSize: 26,
                  fontWeight: 500,
                }}
              >
                عروض العيادة
              </h2>

              <div
                className="offersGrid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 10,
                }}
              >
                {activeOffers.map(
                  (offer) => (
                    <article
                      key={offer.id}
                      style={{
                        padding: 16,
                        background:
                          "rgba(255,184,77,.055)",
                        border:
                          "1px solid rgba(255,184,77,.20)",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          color: "#ffbf69",
                          fontSize: 14,
                        }}
                      >
                        {offer.title}
                      </strong>

                      {offer.description && (
                        <p
                          style={{
                            margin: "8px 0 10px",
                            color:
                              themePalette.muted,
                            lineHeight: 1.8,
                            fontSize: 10,
                          }}
                        >
                          {offer.description}
                        </p>
                      )}

                      <small
                        style={{
                          color:
                            themePalette.muted,
                          fontSize: 9,
                        }}
                      >
                        متاح لغاية{" "}
                        {new Date(
                          offer.expires_at
                        ).toLocaleDateString(
                          "ar-IQ"
                        )}
                      </small>
                    </article>
                  )
                )}
              </div>
            </div>
          </section>
        )}

      {!isPortfolioDoctor && (
        <section
          dir="rtl"
          style={{
            maxWidth: 1180,
            margin: "0 auto 30px",
            padding: "0 24px",
          }}
        >
          <div
            className="themeSurface appointmentSection"
            style={{
              padding: 24,
              background:
                themePalette.surface,
              border:
                `1px solid ${themePalette.border}`,
            }}
          >
            <span
              style={{
                color:
                  themePalette.accent,
                fontSize: 9,
                letterSpacing:
                  ".14em",
              }}
            >
              SMART APPOINTMENT
            </span>

            <h2
              style={{
                margin: "8px 0 8px",
                color:
                  themePalette.text,
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              احجز موعد
            </h2>

            <p
              style={{
                margin: "0 0 16px",
                color:
                  themePalette.muted,
                lineHeight: 1.8,
                fontSize: 11,
              }}
            >
              املأ المعلومات، وبعدها تنفتح رسالة WhatsApp جاهزة للطبيب.
            </p>

            <form
              onSubmit={
                sendAppointmentRequest
              }
            >
              <div
                className="appointmentGrid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(0,1fr))",
                  gap: 10,
                }}
              >
                <input
                  value={appointmentName}
                  onChange={(event) =>
                    setAppointmentName(
                      event.target.value
                    )
                  }
                  required
                  maxLength={60}
                  placeholder="اسم المريض"
                  style={{
                    padding: "13px 14px",
                    color:
                      themePalette.text,
                    background:
                      themePalette.surfaceSoft,
                    border:
                      `1px solid ${themePalette.border}`,
                    outline: "none",
                  }}
                />

                <input
                  value={appointmentService}
                  onChange={(event) =>
                    setAppointmentService(
                      event.target.value
                    )
                  }
                  maxLength={100}
                  list="doctor-services-list"
                  placeholder="الخدمة المطلوبة"
                  style={{
                    padding: "13px 14px",
                    color:
                      themePalette.text,
                    background:
                      themePalette.surfaceSoft,
                    border:
                      `1px solid ${themePalette.border}`,
                    outline: "none",
                  }}
                />

                <datalist id="doctor-services-list">
                  {services.map(
                    (service) => (
                      <option
                        key={service}
                        value={service}
                      />
                    )
                  )}
                </datalist>

                <input
                  value={appointmentDay}
                  onChange={(event) =>
                    setAppointmentDay(
                      event.target.value
                    )
                  }
                  required
                  placeholder="اليوم المفضل، مثال: الأحد"
                  style={{
                    padding: "13px 14px",
                    color:
                      themePalette.text,
                    background:
                      themePalette.surfaceSoft,
                    border:
                      `1px solid ${themePalette.border}`,
                    outline: "none",
                  }}
                />

                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(event) =>
                    setAppointmentTime(
                      event.target.value
                    )
                  }
                  style={{
                    padding: "13px 14px",
                    color:
                      themePalette.text,
                    background:
                      themePalette.surfaceSoft,
                    border:
                      `1px solid ${themePalette.border}`,
                    outline: "none",
                  }}
                />
              </div>

              <textarea
                value={appointmentNote}
                onChange={(event) =>
                  setAppointmentNote(
                    event.target.value
                  )
                }
                rows={3}
                maxLength={300}
                placeholder="ملاحظة اختيارية"
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: "13px 14px",
                  boxSizing:
                    "border-box",
                  color:
                    themePalette.text,
                  background:
                    themePalette.surfaceSoft,
                  border:
                    `1px solid ${themePalette.border}`,
                  outline: "none",
                  resize: "vertical",
                }}
              />

              {appointmentError && (
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#ff8d8d",
                    fontSize: 10,
                  }}
                >
                  {appointmentError}
                </p>
              )}

              <button
                type="submit"
                style={{
                  marginTop: 12,
                  padding: "12px 17px",
                  border: 0,
                  background: "#25D366",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                إرسال طلب الموعد عبر WhatsApp
              </button>
            </form>
          </div>
        </section>
      )}

      {!isPortfolioDoctor &&
        faqItems.length > 0 && (
          <section
            dir="rtl"
            style={{
              maxWidth: 1180,
              margin: "0 auto 30px",
              padding: "0 24px",
            }}
          >
            <div
              className="themeSurface"
              style={{
                padding: 24,
                background:
                  themePalette.surface,
                border:
                  `1px solid ${themePalette.border}`,
              }}
            >
              <span
                style={{
                  color:
                    themePalette.accent,
                  fontSize: 9,
                  letterSpacing:
                    ".14em",
                }}
              >
                FAQ
              </span>

              <h2
                style={{
                  margin: "8px 0 16px",
                  color:
                    themePalette.text,
                  fontSize: 26,
                  fontWeight: 500,
                }}
              >
                الأسئلة الشائعة
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: 9,
                }}
              >
                {faqItems.map(
                  (item, index) => (
                    <details
                      key={`${item.question}-${index}`}
                      style={{
                        padding: "13px 14px",
                        background:
                          themePalette.surfaceSoft,
                        border:
                          `1px solid ${themePalette.border}`,
                      }}
                    >
                      <summary
                        style={{
                          cursor: "pointer",
                          color:
                            themePalette.text,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {item.question}
                      </summary>

                      <p
                        style={{
                          margin: "10px 0 0",
                          color:
                            themePalette.muted,
                          lineHeight: 1.9,
                          whiteSpace: "pre-wrap",
                          fontSize: 11,
                        }}
                      >
                        {item.answer}
                      </p>
                    </details>
                  )
                )}
              </div>
            </div>
          </section>
        )}

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
              className="themeSurface"
              style={{
                padding: 24,
                background: themePalette.surface,
                border: `1px solid ${themePalette.border}`,
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
                className="themeSurface"
                style={{
                  padding: 24,
                  background: themePalette.surface,
                  border: `1px solid ${themePalette.border}`,
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


      {isPremium && (
          <section
            id="doctor-services"
            dir="rtl"
            style={{
              maxWidth: 1180,
              margin: "0 auto 42px",
              padding: "0 24px",
            }}
          >
            {services.length > 0 && (
              <div
                className="themeSurface"
                style={{
                  marginBottom: 22,
                  padding: 24,
                  background:
                    themePalette.surface,
                  border:
                    `1px solid ${themePalette.border}`,
                }}
              >
                <span
                  style={{
                    color: "#32baff",
                    fontSize: 10,
                    letterSpacing:
                      ".12em",
                  }}
                >
                  SERVICES
                </span>

                <h2
                  style={{
                    margin:
                      "8px 0 16px",
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: 500,
                  }}
                >
                  خدمات الطبيب
                </h2>

                <div
                  className="mobileServicesScroller"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {filteredServices.map(
                    (
                      service,
                      index
                    ) => (
                      <button
                        type="button"
                        key={`${service}-${index}`}
                        className="mobileServiceCard"
                        onClick={() =>
                          requestService(
                            service
                          )
                        }
                        style={{
                          padding:
                            "13px 15px",
                          minWidth: 180,
                          border:
                            `1px solid ${themePalette.border}`,
                          background:
                            themePalette.surfaceSoft,
                          color:
                            themePalette.text,
                          textAlign: "right",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            color:
                              themePalette.accent,
                            marginLeft: 8,
                          }}
                        >
                          +
                        </span>
                        {service}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          </section>
        )}

      {/* WORK */}

      <section
        id="doctor-cases"
        className={`${styles.workSection} doctorThemeWork`}
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

        {!isPortfolioDoctor && (
          <div
            className="themeSurface caseSearchPanel"
            style={{
              marginTop: 24,
              padding: 16,
              background:
                themePalette.surface,
              border:
                `1px solid ${themePalette.border}`,
            }}
          >
            <div
              className="caseSearchGrid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0,1fr) auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="ابحث بالحالات أو الخدمات..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  color:
                    themePalette.text,
                  background:
                    themePalette.surfaceSoft,
                  border:
                    `1px solid ${themePalette.border}`,
                  outline: "none",
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  style={{
                    padding: "12px 14px",
                    border:
                      `1px solid ${themePalette.border}`,
                    background:
                      "transparent",
                    color:
                      themePalette.text,
                    cursor: "pointer",
                  }}
                >
                  مسح
                </button>
              )}
            </div>

            {caseCategories.length >
              1 && (
              <div
                className="caseCategoryScroller"
                style={{
                  display: "flex",
                  gap: 7,
                  flexWrap: "wrap",
                  marginTop: 11,
                }}
              >
                {caseCategories.map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setCaseCategoryFilter(
                          category
                        );
                        trackDoctorEvent(
                          "section",
                          `فلتر: ${category}`
                        );
                      }}
                      style={{
                        padding: "8px 10px",
                        border:
                          caseCategoryFilter ===
                          category
                            ? `1px solid ${themePalette.accent}`
                            : `1px solid ${themePalette.border}`,
                        background:
                          caseCategoryFilter ===
                          category
                            ? themePalette.surfaceSoft
                            : "transparent",
                        color:
                          caseCategoryFilter ===
                          category
                            ? themePalette.accent
                            : themePalette.muted,
                        cursor: "pointer",
                        fontSize: 9,
                      }}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            )}

            <p
              style={{
                margin: "10px 0 0",
                color:
                  themePalette.muted,
                fontSize: 9,
              }}
            >
              النتائج: {filteredCases.length} حالة
              {isPremium
                ? ` • ${filteredServices.length} خدمة`
                : ""}
            </p>
          </div>
        )}

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

        {filteredCases.length > 0 && (
          <div
            className="mobileCasesScroller"
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fill, minmax(320px, 420px))",

              justifyContent:
                "center",

              alignItems:
                "start",

              gap: "24px",

              marginTop:
                "40px",
            }}
          >
            {filteredCases.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className="mobileCaseCard"
                  style={{
                    width:
                      "100%",
                    maxWidth:
                      "420px",
                    border:
                      "1px solid rgba(0,140,255,.18)",

                    padding:
                      "16px",

                    background:
                      "rgba(0,10,20,.45)",
                  }}
                >
                  {item.category && (
                    <span
                      style={{
                        display: "inline-block",
                        marginBottom: 8,
                        padding: "5px 8px",
                        color:
                          themePalette.accent,
                        border:
                          `1px solid ${themePalette.border}`,
                        fontSize: 8,
                      }}
                    >
                      {item.category}
                    </span>
                  )}

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
                      marginTop: 14,
                    }}
                  >
                    <BeforeAfterSlider
                      before={
                        item.before_image
                      }
                      after={
                        item.after_image
                      }
                      title={
                        item.title
                      }
                    />
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {!isPortfolioDoctor &&
          cases.length > 0 &&
          filteredCases.length === 0 && (
          <p
            style={{
              marginTop: "40px",
              opacity: 0.62,
              textAlign: "center",
            }}
          >
            ماكو حالات مطابقة للبحث أو الفلتر الحالي.
          </p>
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

      {isPremium && (
        <section
          id="doctor-reviews"
          dir="rtl"
          className="patientReviewsSection"
          style={{
            maxWidth: 1180,
            margin: "54px auto 46px",
            padding: "0 24px",
          }}
        >
          <div
            className="themeSurface"
            style={{
              position: "relative",
              overflow: "hidden",
              padding: 26,
              background:
                themePalette.surface,
              border:
                `1px solid ${themePalette.border}`,
              boxShadow:
                "0 22px 70px rgba(0,0,0,.22)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                left: -90,
                top: -120,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(199,168,93,.10),transparent 68%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-end",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: 22,
              }}
            >
              <div>
                <span
                  style={{
                    color: "#c7a85d",
                    fontSize: 9,
                    letterSpacing: ".22em",
                    fontWeight: 700,
                  }}
                >
                  PATIENT REVIEWS
                </span>

                <h2
                  style={{
                    margin: "7px 0 6px",
                    color: "#fff",
                    fontSize: 30,
                    fontWeight: 500,
                    lineHeight: 1.15,
                  }}
                >
                  آراء المرضى
                </h2>

                <p
                  style={{
                    margin: 0,
                    color:
                      "rgba(255,255,255,.48)",
                    fontSize: 12,
                    lineHeight: 1.8,
                  }}
                >
                  تجارب منشورة بعد موافقة الطبيب.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  minWidth: 150,
                  background:
                    "rgba(199,168,93,.055)",
                  border:
                    "1px solid rgba(199,168,93,.16)",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {reviewsAverage}
                </div>

                <div>
                  <div
                    style={{
                      color: "#f2ca64",
                      fontSize: 13,
                      letterSpacing: ".04em",
                    }}
                  >
                    ★★★★★
                  </div>

                  <span
                    style={{
                      display: "block",
                      marginTop: 3,
                      color:
                        "rgba(255,255,255,.38)",
                      fontSize: 9,
                    }}
                  >
                    {patientReviews.length} تقييم منشور
                  </span>
                </div>
              </div>
            </div>

            {patientReviews.length > 0 ? (
              <div
                className="mobileReviewsScroller"
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(250px,1fr))",
                  gap: 14,
                }}
              >
                {patientReviews.map(
                  (review) => (
                    <article
                      key={review.id}
                      className="mobileReviewCard"
                      style={{
                        position: "relative",
                        minHeight: 180,
                        padding: 19,
                        background:
                          "linear-gradient(160deg,rgba(255,255,255,.035),rgba(255,255,255,.012))",
                        border:
                          "1px solid rgba(255,255,255,.075)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: 5,
                          left: 14,
                          color:
                            "rgba(199,168,93,.12)",
                          fontSize: 68,
                          fontFamily: "Georgia,serif",
                          lineHeight: 1,
                          pointerEvents: "none",
                        }}
                      >
                        “
                      </div>

                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 10,
                            marginBottom: 15,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              aria-hidden="true"
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                flex: "0 0 auto",
                                color: "#c7a85d",
                                background:
                                  "rgba(199,168,93,.08)",
                                border:
                                  "1px solid rgba(199,168,93,.17)",
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {review.patient_name
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong
                                style={{
                                  display: "block",
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {review.patient_name}
                              </strong>

                              <span
                                style={{
                                  display: "block",
                                  marginTop: 3,
                                  color:
                                    "rgba(255,255,255,.32)",
                                  fontSize: 9,
                                }}
                              >
                                تجربة مريض
                              </span>
                            </div>
                          </div>

                          <div
                            aria-label={`${review.rating} من 5 نجوم`}
                            style={{
                              color: "#f2ca64",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                              letterSpacing: ".03em",
                            }}
                          >
                            {"★".repeat(
                              review.rating
                            )}
                            <span
                              style={{
                                color:
                                  "rgba(255,255,255,.13)",
                              }}
                            >
                              {"★".repeat(
                                5 -
                                  review.rating
                              )}
                            </span>
                          </div>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            color:
                              "rgba(255,255,255,.68)",
                            fontSize: 12,
                            lineHeight: 2,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {review.review_text}
                        </p>
                      </div>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "22px 18px",
                  textAlign: "center",
                  color:
                    "rgba(255,255,255,.42)",
                  background:
                    "rgba(255,255,255,.02)",
                  border:
                    "1px dashed rgba(255,255,255,.08)",
                  fontSize: 12,
                }}
              >
                لا توجد آراء منشورة بعد — كن أول من يشارك تجربته.
              </div>
            )}

            <form
              onSubmit={submitPatientReview}
              className="patientReviewForm"
              style={{
                position: "relative",
                zIndex: 1,
                marginTop: 24,
                padding: 20,
                background:
                  "rgba(0,0,0,.20)",
                border:
                  "1px solid rgba(50,186,255,.12)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                <label htmlFor="patient-review-website">
                  Website
                </label>

                <input
                  id="patient-review-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={reviewWebsite}
                  onChange={(event) =>
                    setReviewWebsite(
                      event.target.value
                    )
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#32baff",
                      fontSize: 9,
                      letterSpacing: ".16em",
                    }}
                  >
                    SHARE YOUR EXPERIENCE
                  </span>

                  <h3
                    style={{
                      margin: "6px 0 4px",
                      color: "#fff",
                      fontSize: 21,
                      fontWeight: 500,
                    }}
                  >
                    قيّم تجربتك
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "rgba(255,255,255,.42)",
                      fontSize: 11,
                      lineHeight: 1.8,
                    }}
                  >
                    رأيك يُرسل للطبيب ويظهر بالموقع بعد الموافقة.
                  </p>
                </div>

                <div
                  style={{
                    padding: "8px 10px",
                    color:
                      "rgba(255,255,255,.40)",
                    fontSize: 9,
                    border:
                      "1px solid rgba(255,255,255,.07)",
                  }}
                >
                  بدون تسجيل حساب
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0,1fr) minmax(220px,.65fr)",
                  gap: 12,
                }}
                className="patientReviewTopFields"
              >
                <div>
                  <label
                    htmlFor="patient-review-name"
                    style={{
                      display: "block",
                      color: "#c7a85d",
                      fontSize: 9,
                      marginBottom: 7,
                      letterSpacing: ".08em",
                    }}
                  >
                    الاسم
                  </label>

                  <input
                    id="patient-review-name"
                    value={reviewName}
                    onChange={(e) =>
                      setReviewName(
                        e.target.value
                      )
                    }
                    maxLength={60}
                    required
                    autoComplete="name"
                    placeholder="اكتب اسمك"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 14px",
                      color: "#fff",
                      background:
                        "rgba(255,255,255,.025)",
                      border:
                        "1px solid rgba(255,255,255,.09)",
                      outline: "none",
                      fontSize: 12,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#c7a85d",
                      fontSize: 9,
                      marginBottom: 7,
                      letterSpacing: ".08em",
                    }}
                  >
                    التقييم
                  </label>

                  <div
                    aria-label="اختر التقييم"
                    style={{
                      display: "flex",
                      gap: 5,
                      minHeight: 43,
                      alignItems: "center",
                      padding: "0 11px",
                      background:
                        "rgba(255,255,255,.025)",
                      border:
                        "1px solid rgba(255,255,255,.09)",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              star
                            )
                          }
                          aria-label={`${star} نجوم`}
                          style={{
                            border: 0,
                            padding: 2,
                            background:
                              "transparent",
                            color:
                              star <=
                              reviewRating
                                ? "#f2ca64"
                                : "rgba(255,255,255,.16)",
                            fontSize: 21,
                            lineHeight: 1,
                            cursor: "pointer",
                          }}
                        >
                          ★
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <label
                htmlFor="patient-review-text"
                style={{
                  display: "block",
                  color: "#c7a85d",
                  fontSize: 9,
                  margin: "14px 0 7px",
                  letterSpacing: ".08em",
                }}
              >
                رأيك
              </label>

              <textarea
                id="patient-review-text"
                value={reviewText}
                onChange={(e) =>
                  setReviewText(
                    e.target.value
                  )
                }
                required
                maxLength={700}
                rows={4}
                placeholder="اكتب تجربتك مع الطبيب..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  color: "#fff",
                  background:
                    "rgba(255,255,255,.025)",
                  border:
                    "1px solid rgba(255,255,255,.09)",
                  outline: "none",
                  resize: "vertical",
                  fontSize: 12,
                  lineHeight: 1.8,
                }}
              />

              {reviewError && (
                <p
                  style={{
                    margin:
                      "10px 0 0",
                    color: "#ff9b9b",
                    fontSize: 11,
                  }}
                >
                  {reviewError}
                </p>
              )}

              {reviewMessage && (
                <p
                  style={{
                    margin:
                      "10px 0 0",
                    color: "#62e89a",
                    fontSize: 11,
                  }}
                >
                  {reviewMessage}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 14,
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,.28)",
                    fontSize: 9,
                  }}
                >
                  لا تضف معلومات صحية أو شخصية حساسة.
                </span>

                <button
                  type="submit"
                  disabled={reviewSending}
                  style={{
                    minWidth: 150,
                    padding: "12px 18px",
                    border:
                      "1px solid rgba(50,186,255,.28)",
                    background:
                      reviewSending
                        ? "rgba(50,186,255,.05)"
                        : "linear-gradient(135deg,rgba(50,186,255,.16),rgba(50,186,255,.06))",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor:
                      reviewSending
                        ? "wait"
                        : "pointer",
                  }}
                >
                  {reviewSending
                    ? "جاري الإرسال..."
                    : "إرسال التقييم"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* FOOTER */}

      <footer
        className={`${styles.footer} doctorThemeFooter`}
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


      {!isPortfolioDoctor &&
        phone && (
          <div
            className="mobileBookingBar"
            dir="rtl"
          >
            <button
              type="button"
              onClick={openWhatsApp}
            >
              احجز / تواصل عبر WhatsApp
            </button>
          </div>
        )}

      <style jsx global>{`
        .doctorThemeRoot {
          min-height: 100vh;
          transition:
            background .28s ease,
            color .28s ease;
        }

        .doctorThemeRoot .themeSurface {
          transition:
            background .28s ease,
            color .28s ease,
            border-color .28s ease,
            box-shadow .28s ease;
        }

        /* =========================
           DARK BLUE
        ========================== */
        .doctorThemeRoot[data-site-theme="dark-blue"] {
          background:
            radial-gradient(circle at 18% 10%, rgba(50,186,255,.12), transparent 28%),
            linear-gradient(180deg,#020914 0%,#02070e 52%,#01040a 100%) !important;
          color: #ffffff !important;
        }

        .doctorThemeRoot[data-site-theme="dark-blue"] .doctorThemeBackground {
          opacity: 1 !important;
          filter: none !important;
        }

        .doctorThemeRoot[data-site-theme="dark-blue"] .doctorThemeNav {
          background:
            rgba(2,9,20,.72) !important;
          border-color:
            rgba(50,186,255,.12) !important;
        }

        .doctorThemeRoot[data-site-theme="dark-blue"] .doctorThemeWork {
          background:
            radial-gradient(circle at 75% 20%, rgba(50,186,255,.08), transparent 30%),
            linear-gradient(180deg,#020914 0%,#031126 55%,#02070e 100%) !important;
        }

        /* =========================
           BLACK & GOLD
        ========================== */
        .doctorThemeRoot[data-site-theme="black-gold"] {
          background:
            radial-gradient(circle at 18% 8%, rgba(214,180,94,.14), transparent 28%),
            radial-gradient(circle at 82% 30%, rgba(214,180,94,.08), transparent 22%),
            linear-gradient(180deg,#0a0804 0%,#040403 55%,#000000 100%) !important;
          color: #fffaf0 !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeBackground {
          display: none !important;
          opacity: 0 !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeHeading {
          background:
            radial-gradient(circle at 16% 8%, rgba(214,180,94,.12), transparent 32%),
            linear-gradient(180deg,#0a0804,#050403) !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeWork {
          background:
            radial-gradient(circle at 78% 22%, rgba(214,180,94,.09), transparent 28%),
            linear-gradient(180deg,#050403 0%,#090704 48%,#020201 100%) !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeFooter {
          background:
            #020201 !important;
          border-color:
            rgba(214,180,94,.16) !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeNav {
          background:
            rgba(9,7,3,.90) !important;
          border-color:
            rgba(214,180,94,.26) !important;
          box-shadow:
            0 10px 35px rgba(0,0,0,.18);
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeNav span,
        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeHeading .eyebrow,
        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeWork .eyebrow {
          color: #d6b45e !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeHeading em,
        .doctorThemeRoot[data-site-theme="black-gold"] .doctorThemeWork em {
          color: #d6b45e !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .themeSurface {
          background:
            linear-gradient(145deg,rgba(20,16,8,.94),rgba(6,5,3,.98)) !important;
          border-color:
            rgba(214,180,94,.24) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.02),
            0 18px 42px rgba(0,0,0,.18);
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .mobileCaseCard {
          background:
            linear-gradient(145deg,rgba(19,15,8,.94),rgba(4,4,3,.98)) !important;
          border-color:
            rgba(214,180,94,.23) !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .mobileCaseCard h3,
        .doctorThemeRoot[data-site-theme="black-gold"] .mobileCaseCard p,
        .doctorThemeRoot[data-site-theme="black-gold"] .mobileCaseCard small {
          color: #fffaf0 !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .patientReviewForm {
          background:
            rgba(214,180,94,.035) !important;
          border-color:
            rgba(214,180,94,.18) !important;
        }

        .doctorThemeRoot[data-site-theme="black-gold"] .mobileBookingBar {
          border-color:
            rgba(214,180,94,.24) !important;
          background:
            rgba(8,6,3,.92) !important;
        }

        /* =========================
           CLEAN WHITE
        ========================== */
        .doctorThemeRoot[data-site-theme="clean-white"] {
          background:
            radial-gradient(circle at 18% 8%, rgba(22,119,167,.10), transparent 26%),
            linear-gradient(180deg,#ffffff 0%,#f5f8fa 52%,#edf2f5 100%) !important;
          color: #0c1720 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeBackground {
          display: none !important;
          opacity: 0 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeHeading {
          background:
            radial-gradient(circle at 16% 8%, rgba(22,119,167,.08), transparent 30%),
            linear-gradient(180deg,#ffffff,#f7fafb) !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeWork {
          background:
            linear-gradient(180deg,#f7fafb 0%,#eef4f7 55%,#e9f0f4 100%) !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeFooter {
          background:
            #edf3f6 !important;
          border-color:
            rgba(12,23,32,.10) !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeNav {
          background:
            rgba(255,255,255,.94) !important;
          border-color:
            rgba(12,23,32,.10) !important;
          box-shadow:
            0 8px 30px rgba(12,23,32,.05);
          backdrop-filter:
            blur(16px);
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeNav,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeNav * {
          color: #0c1720 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeHeading h1,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeHeading p,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeHeading span,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeWork h2,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeWork p,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeFooter h2,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeFooter p {
          color: #0c1720 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeHeading em,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeWork em,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeHeading .eyebrow,
        .doctorThemeRoot[data-site-theme="clean-white"] .doctorThemeWork .eyebrow {
          color: #1677a7 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .themeSurface {
          background:
            rgba(255,255,255,.96) !important;
          border-color:
            rgba(12,23,32,.10) !important;
          box-shadow:
            0 14px 38px rgba(12,23,32,.055);
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .themeSurface h2,
        .doctorThemeRoot[data-site-theme="clean-white"] .themeSurface h3,
        .doctorThemeRoot[data-site-theme="clean-white"] .themeSurface strong,
        .doctorThemeRoot[data-site-theme="clean-white"] .themeSurface span {
          color: #0c1720 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .themeSurface p {
          color:
            rgba(12,23,32,.62) !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .mobileCaseCard {
          background:
            rgba(255,255,255,.97) !important;
          border-color:
            rgba(12,23,32,.10) !important;
          box-shadow:
            0 12px 34px rgba(12,23,32,.06);
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .mobileCaseCard h3,
        .doctorThemeRoot[data-site-theme="clean-white"] .mobileCaseCard p,
        .doctorThemeRoot[data-site-theme="clean-white"] .mobileCaseCard small {
          color: #0c1720 !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .patientReviewForm {
          background:
            rgba(12,23,32,.035) !important;
          border-color:
            rgba(22,119,167,.14) !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .patientReviewForm input,
        .doctorThemeRoot[data-site-theme="clean-white"] .patientReviewForm textarea {
          color: #0c1720 !important;
          background:
            rgba(12,23,32,.025) !important;
          border-color:
            rgba(12,23,32,.10) !important;
        }

        .doctorThemeRoot[data-site-theme="clean-white"] .mobileBookingBar {
          background:
            rgba(255,255,255,.94) !important;
          border-color:
            rgba(37,211,102,.30) !important;
        }

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
            max-width: none !important;
            min-width: 0 !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .beforeAfterSlider {
            height: 330px !important;
          }

          .mobileServicesScroller,
          .mobileReviewsScroller {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 82vw !important;
            grid-template-columns: none !important;
            flex-wrap: nowrap !important;
            gap: 12px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 10px;
          }

          .mobileServicesScroller::-webkit-scrollbar,
          .mobileReviewsScroller::-webkit-scrollbar {
            display: none;
          }

          .mobileServiceCard,
          .mobileReviewCard {
            min-width: 0 !important;
            width: 100% !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .mobileBookingBar {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            z-index: 9999;
            display: flex;
            padding: 8px;
            background: rgba(2,4,9,.88);
            border: 1px solid rgba(37,211,102,.28);
            backdrop-filter: blur(14px);
            box-shadow: 0 12px 35px rgba(0,0,0,.35);
          }

          .clinicInfoGrid,
          .appointmentGrid,
          .caseSearchGrid {
            grid-template-columns:
              1fr !important;
          }

          .doctorCover {
            height:
              170px !important;
          }

          .caseCategoryScroller {
            flex-wrap:
              nowrap !important;
            overflow-x:
              auto !important;
            scrollbar-width:
              none;
            padding-bottom: 4px;
          }

          .caseCategoryScroller::-webkit-scrollbar {
            display: none;
          }

          .patientReviewTopFields {
            grid-template-columns: 1fr !important;
          }

          .patientReviewsSection {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .mobileBookingBar button {
            width: 100%;
            border: 0;
            padding: 14px 16px;
            background: #25D366;
            color: #fff;
            font-weight: 800;
            cursor: pointer;
          }
        }

        @media (min-width: 769px) {
          .mobileBookingBar {
            display: none !important;
          }
        }

        @media (max-width: 430px) {
          .mobileVideosScroller,
          .mobileCasesScroller,
          .mobileServicesScroller,
          .mobileReviewsScroller {
            grid-auto-columns: 86vw !important;
          }

          .beforeAfterSlider {
            height: 300px !important;
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