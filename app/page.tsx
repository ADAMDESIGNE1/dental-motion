"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  image: string;
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
    name: "DR SAIF ",
    specialty: "DR SAIF ",
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
    specialty: "Dr BASSMA ",
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


export default function HomePage() {
  const router = useRouter();

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

  return (
    <main className="home-page">

      {/* =====================================================
          CYBER BACKGROUND
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
            Excellence in dentistry, precision in every detail
            and a smile designed with care.
          </p>

          <div className="personal-hero-line" />

          <span className="personal-hero-scroll">
            SCROLL TO MEET THE TEAM
          </span>

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


      {/* =====================================================
          TEAM
      ===================================================== */}

      <section className="doctors-section">

        <div className="doctors-heading">

          <div>

            <span className="hero-small-label">
              OUR SPECIALISTS
            </span>

            <h2>
              The Whole Team
              <br />
              <span>Behind Your Smile</span>
            </h2>

          </div>

          <p>
            Meet our specialists and explore their work,
            treatments and patient transformations.
          </p>

        </div>


        <div className="doctors-grid">

          {doctors.map((doctor, index) => (

            <button
              key={doctor.id}
              type="button"
              className="doctor-card"
              onClick={() =>
                router.push(`/doctor/${doctor.id}`)
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
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="doctor-hover">

                  <span>
                    VIEW PROFILE
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

          ))}

        </div>

      </section>


      {/* =====================================================
          FINAL CONTACT SECTION
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
            <span>tells a story.</span>
          </h2>

          <p>
            Precision. Design. Motion.
            <br />
            Your smile deserves all three.
          </p>

          <div className="contact-actions">

            <a href="tel:+9647803447144">
              CALL US
            </a>

            <a href="mailto:salieeeem543@gmail.com">
              EMAIL US
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

    </main>
  );
}