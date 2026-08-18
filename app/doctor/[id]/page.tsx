"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./DoctorPage.module.css";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  phone: string;
  bio: string;
  videos: string[];
};

const doctors: Doctor[] = [
  {
    id: "doctor1",
    name: "Dr. Ghassan",
    specialty: "Cosmetic Dentistry",
    image: "/doctor1.jpg",
    location: "Baghdad, Iraq",
    phone: "+964 780 344 7144",
    bio: "Specialist in cosmetic dentistry, smile design and advanced dental treatments.",
    videos: [
    "https://res.cloudinary.com/mihbnzji/video/upload/v1787080827/doctor1-1.mp4",
      "/video/doctor1-2.mp4",
      "/video/doctor1-3.mp4",
 "/video/doctor1-4.mp4",
      "/video/doctor1-5.mp4",
      "/video/doctor1-6.mp4",
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
      "/video/doctor2-1.mp4",
      "/video/doctor2-2.mp4",
      "/video/doctor2-3.mp4",
 "/video/doctor2-4.mp4",
      "/video/doctor2-5.mp4",
      "/video/doctor2-6.mp4",
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
      "/video/doctor3-1.mp4",
      "/video/doctor3-2.mp4",
      "/video/doctor3-3.mp4",
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
      "/video/doctor4-1.mp4",
      "/video/doctor4-2.mp4",
      "/video/doctor4-3.mp4",
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
      "/video/doctor5-1.mp4",
      "/video/doctor5-2.mp4",
      "/video/doctor5-3.mp4",
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
      "/video/doctor6-1.mp4",
      "/video/doctor6-2.mp4",
      "/video/doctor6-3.mp4",
"/video/doctor6-4.mp4",
      "/video/doctor6-5.mp4",
      "/video/doctor6-6.mp4",

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
      "/video/doctor7-1.mp4",
      "/video/doctor7-2.mp4",
      "/video/doctor7-3.mp4",
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
      "/video/doctor8-1.mp4",
      "/video/doctor8-2.mp4",
      "/video/doctor8-3.mp4",
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
      "/video/doctor9-1.mp4",
      "/video/doctor9-2.mp4",
      "/video/doctor9-3.mp4",
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
      "/video/doctor10-1mp4",
     "/video/doctor10-2mp4",
"/video/doctor10-3mp4",
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
      "/video/doctor11-1.mp4",
      "/video/doctor11-2.mp4",
      "/video/doctor11-3.mp4",
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
      "/video/doctor12-1.mp4",
      "/video/doctor12-2.MP4",
      "/video/doctor12-3.MP4",
    ],
 },

];

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
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.currentTime = 0;

    videoElement.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.pause();
    videoElement.currentTime = 0;
  };

  return (
    <article
      className={styles.videoCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={video}
        muted
        playsInline
        preload="metadata"
      />

      <div className={styles.videoOverlay} />

      <div className={styles.videoTop}>
        <span>{String(number).padStart(2, "0")}</span>
        <span>VIDEO</span>
      </div>

      <div className={styles.play}>
        <span>▶</span>
      </div>

      <div className={styles.videoBottom}>
        <span>PLAY ON HOVER</span>
        <span>↗</span>
      </div>
    </article>
  );
}

/* =====================================================
   DOCTOR PAGE
===================================================== */

export default function DoctorPage() {
  const params = useParams();
  const router = useRouter();

  /* =====================================================
     MOUSE MOVEMENT
  ===================================================== */

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
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;

      document.documentElement.style.setProperty(
        "--mouse-x",
        `${currentX}`
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${currentY}`
      );

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  /* =====================================================
     GET DOCTOR
  ===================================================== */

  const doctorId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const doctor = doctors.find(
    (item) => item.id === doctorId
  );

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!doctor) {
    return (
      <main className={styles.page}>

        <div
          className={styles.cyberBackground}
          aria-hidden="true"
        >
          <div className={styles.cyberImage} />
          <div className={styles.cyberDark} />

          <div
            className={`${styles.cyberBlueGlow} ${styles.glowOne}`}
          />

          <div
            className={`${styles.cyberBlueGlow} ${styles.glowTwo}`}
          />

          <div
            className={`${styles.cyberPurpleGlow} ${styles.glowThree}`}
          />

          <div className={styles.cyberGrid} />
          <div className={styles.cyberScanline} />

          <div className={styles.cyberParticles}>
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

        <div className={styles.notFound}>

          <span>DOCTOR PROFILE</span>

          <h1>Doctor not found</h1>

          <button
            onClick={() => router.push("/")}
            type="button"
          >
            ← BACK TO TEAM
          </button>

        </div>

      </main>
    );
  }

  /* =====================================================
     DOCTOR NUMBER
  ===================================================== */

  const doctorNumber = String(
    doctors.findIndex(
      (item) => item.id === doctor.id
    ) + 1
  ).padStart(2, "0");

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main className={styles.page}>

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className={styles.cyberBackground}
        aria-hidden="true"
      >
        <div className={styles.cyberImage} />

        <div className={styles.cyberDark} />

        <div
          className={`${styles.cyberBlueGlow} ${styles.glowOne}`}
        />

        <div
          className={`${styles.cyberBlueGlow} ${styles.glowTwo}`}
        />

        <div
          className={`${styles.cyberPurpleGlow} ${styles.glowThree}`}
        />

        <div className={styles.cyberGrid} />

        <div className={styles.cyberScanline} />

        <div className={styles.cyberParticles}>
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

      {/* =================================================
          NAV
      ================================================= */}

      <header className={styles.nav}>

        <button
          className={styles.backButton}
          onClick={() => router.push("/")}
          type="button"
        >
          ← BACK TO TEAM
        </button>

        <div className={styles.logo}>
          DENTAL <span>MOTION</span>
        </div>

        <div className={styles.navNumber}>
          {doctorNumber}
        </div>

      </header>

      {/* =================================================
          DOCTOR HEADING
      ================================================= */}

      <section className={styles.heading}>

        <div className={styles.doctorProfile}>

          {/* =================================================
              PHOTO
          ================================================= */}

          <div className={styles.doctorPhoto}>

            <img
              src={doctor.image}
              alt={doctor.name}
              className={styles.doctorPhotoImage}
            />

          </div>

          {/* =================================================
              DOCTOR INFORMATION
          ================================================= */}

          <div className={styles.doctorInfo}>

            <span className={styles.eyebrow}>
              {doctor.specialty}
            </span>

            <h1>
              {doctor.name}
            </h1>

            <p>
              {doctor.bio}
            </p>

            <p>
              📍 {doctor.location}
            </p>

            <p>
              ☎ {doctor.phone}
            </p>

            <p>
              Selected work &amp; treatments
            </p>

          </div>

        </div>

        <div className={styles.line} />

      </section>

      {/* =================================================
          WORK
      ================================================= */}

      <section className={styles.workSection}>

        <div className={styles.workHeader}>

          <div>

            <span className={styles.eyebrow}>
              SELECTED WORK
            </span>

            <h2>
              Videos
              <br />
              <em>&amp; treatments.</em>
            </h2>

          </div>

          <p>
            Move your cursor over each video
            <br />
            to discover the work.
          </p>

        </div>

        <div className={styles.videosList}>

          {doctor.videos.map((video, index) => (

            <VideoCard
              key={video}
              video={video}
              number={index + 1}
            />

          ))}

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className={styles.footer}>

        <div>

          <span className={styles.footerLabel}>
            DENTAL MOTION
          </span>

          <h2>
            Every smile
            <br />
            tells a story.
          </h2>

        </div>

        <button
          className={styles.footerButton}
          onClick={() => router.push("/")}
          type="button"
        >
          BACK TO TEAM
        </button>

      </footer>

    </main>
  );
}