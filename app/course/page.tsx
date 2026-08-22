"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CoursePage() {
  const router = useRouter();

  const [name, setName] =
    useState("");
  const [whatsapp, setWhatsapp] =
    useState("");
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [bookingSuccess, setBookingSuccess] =
    useState(false);
  const [bookingMessage, setBookingMessage] =
    useState("");
  const [waitlistCount, setWaitlistCount] =
    useState<number | null>(null);

  async function loadWaitlistCount() {
    const { data, error } =
      await supabase.rpc(
        "get_course_waitlist_count"
      );

    if (!error && data !== null) {
      setWaitlistCount(Number(data));
    }
  }

  useEffect(() => {
    void loadWaitlistCount();
  }, []);

  async function reserveSpot(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanWhatsApp = whatsapp.trim();

    setBookingMessage("");
    setBookingSuccess(false);

    if (!cleanName || !cleanWhatsApp) {
      setBookingMessage(
        "اكتب اسمك ورقم الواتساب حتى نثبت حجزك المبدئي."
      );
      return;
    }

    try {
      setBookingLoading(true);

      const { error } =
        await supabase
          .from("course_waitlist")
          .insert({
            full_name: cleanName,
            whatsapp: cleanWhatsApp,
          });

      if (error) {
        if (error.code === "23505") {
          setBookingMessage(
            "هذا الرقم مسجل بالحجز المبدئي من قبل ✓"
          );
          await loadWaitlistCount();
          return;
        }

        throw error;
      }

      setBookingSuccess(true);
      setBookingMessage(
        "تم حجز مكانك مبدئياً بنجاح ✓"
      );
      setName("");
      setWhatsapp("");

      await loadWaitlistCount();
    } catch (error) {
      console.error(
        "COURSE WAITLIST:",
        error
      );

      setBookingMessage(
        "صار خطأ أثناء تسجيل الحجز. حاول مرة ثانية."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <main className="course-page" dir="rtl">
      <div className="course-bg">
        <div className="grid" />
        <div className="glow glow-a" />
        <div className="glow glow-b" />
      </div>

      <header className="course-nav">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="back-button"
        >
          ← العودة للرئيسية
        </button>

        <span className="brand">
          ADAM DESIGN
        </span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="kicker">
            <span className="live-dot" />
            ترقّب الإطلاق قريباً
          </div>

          <div className="title-wrap">
            <span className="coming">
              قريباً
            </span>

            <h1>
              DENTAL
              <br />
              <b>EDITING</b>
              <br />
              COURSE
            </h1>
          </div>

          <div className="rotating-copy">
            <span>
              من Photoshop إلى After Effects
            </span>
            <span>
              مونتاج أسنان من الصفر
            </span>
            <span>
              ذكاء اصطناعي يسرّع شغلك
            </span>
          </div>

          <p className="lead">
            كورس عملي مخصص لمونتاج محتوى الأسنان.
            راح تتعلم خطوة بخطوة من تجهيز الصورة
            إلى صناعة فيديو احترافي يلفت النظر
            ويعرض شغل الطبيب بمستوى أقوى.
          </p>

          <a
            href="#reserve"
            className="hero-cta"
          >
            <span>
              احجز اهتمامك من هسه
            </span>
            <b>↓</b>
          </a>
        </div>

        <div className="hero-visual">
          <div className="visual-ring ring-one" />
          <div className="visual-ring ring-two" />

          <div className="course-poster-shell">
            <div className="course-poster-border" />

            <div className="course-poster-inner">
              <img
                src="/dental-editing-course-2000.png"
                alt="Dental Editing Course Coming Soon"
                className="course-poster-image"
              />

              <div className="course-poster-shine" />

              <div className="course-poster-status">
                <span className="live-dot" />
                COMING SOON
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <span>
              داخل الكورس
            </span>

            <h2>
              شنو راح
              <br />
              <b>تتعلم؟</b>
            </h2>
          </div>

          <p>
            مو بس أدوات. راح تتعلم Workflow كامل
            حتى تعرف منين تبدأ، شلون ترتب شغلك،
            وشلون تطلع نتيجة احترافية.
          </p>
        </div>

        <div className="learning-grid">
          <article>
            <span>01</span>
            <strong>
              Photoshop
            </strong>
            <p>
              قص وفصل الأشخاص والعناصر بدقة،
              تنظيف الصور، ترتيب الطبقات،
              والتعامل ويا الصورة من البداية.
            </p>
          </article>

          <article>
            <span>02</span>
            <strong>
              تعديل الألوان
            </strong>
            <p>
              تصحيح الإضاءة والألوان وإبراز
              تفاصيل حالات الأسنان بصورة
              مرتبة وطبيعية.
            </p>
          </article>

          <article>
            <span>03</span>
            <strong>
              After Effects
            </strong>
            <p>
              تعلم الحركة، الانتقالات،
              ترتيب المشاهد وصناعة مونتاج
              Dental احترافي.
            </p>
          </article>

          <article>
            <span>04</span>
            <strong>
              Sound Design
            </strong>
            <p>
              شلون تختار وتضيف الأصوات
              والمؤثرات حتى يصير الفيديو
              أقوى وأكثر حياة.
            </p>
          </article>

          <article>
            <span>05</span>
            <strong>
              Before / After
            </strong>
            <p>
              عرض الحالة قبل وبعد بطريقة
              جذابة وواضحة تخلي النتيجة
              تبين بقوة.
            </p>
          </article>

          <article>
            <span>06</span>
            <strong>
              AI Workflow
            </strong>
            <p>
              استخدام أدوات الذكاء الاصطناعي
              للأفكار، الصور، وتسريع خطوات
              المونتاج بدون تعقيد.
            </p>
          </article>
        </div>
      </section>

      <section className="journey">
        <span className="journey-label">
          من الصفر إلى النتيجة
        </span>

        <div className="journey-track">
          <div>
            <span>01</span>
            <strong>جهّز</strong>
            <p>قص وفصل وترتيب الصورة.</p>
          </div>

          <i>→</i>

          <div>
            <span>02</span>
            <strong>عدّل</strong>
            <p>ألوان وإضاءة وتفاصيل.</p>
          </div>

          <i>→</i>

          <div>
            <span>03</span>
            <strong>حرّك</strong>
            <p>After Effects ومونتاج.</p>
          </div>

          <i>→</i>

          <div>
            <span>04</span>
            <strong>طوّر</strong>
            <p>صوت وAI ولمسات نهائية.</p>
          </div>
        </div>
      </section>

      <section
        id="reserve"
        className="reserve-section"
      >
        <div className="reserve-copy">
          <span>
            EARLY ACCESS
          </span>

          <h2>
            احجز مكانك
            <br />
            <b>قبل الإطلاق</b>
          </h2>

          <p>
            إذا مهتم بالكورس، اكتب اسمك
            ورقم الواتساب فقط. راح نراسلك
            أول ما يفتح التسجيل الرسمي.
          </p>

          <div className="no-payment">
            <span>✓</span>

            <div>
              <strong>
                بدون دفع حالياً
              </strong>

              <small>
                هذا حجز اهتمام مبدئي فقط.
                الدفع يكون لاحقاً عند فتح التسجيل.
              </small>
            </div>
          </div>

          <div className="waitlist-counter">
            <div className="waitlist-counter-icon">
              ◉
            </div>

            <div>
              <strong>
                {waitlistCount === null
                  ? "جاري تحميل العدد..."
                  : `${waitlistCount} شخص حاجزين بانتظار الكورس`}
              </strong>

              <small>
                العدد يتحدث تلقائياً مع كل حجز جديد.
              </small>
            </div>
          </div>
        </div>

        <form
          className="reserve-form"
          onSubmit={reserveSpot}
        >
          <label>
            <span>
              الاسم الكامل
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="اكتب اسمك"
              autoComplete="name"
            />
          </label>

          <label>
            <span>
              رقم الواتساب
            </span>

            <input
              type="tel"
              value={whatsapp}
              onChange={(event) =>
                setWhatsapp(
                  event.target.value
                )
              }
              placeholder="07XXXXXXXXX"
              autoComplete="tel"
            />
          </label>

          <button
            type="submit"
            disabled={bookingLoading}
          >
            <span>
              {bookingLoading
                ? "جاري تسجيل الحجز..."
                : "احجز مكاني مبدئياً"}
            </span>

            <b>
              {bookingLoading ? "…" : "←"}
            </b>
          </button>

          {bookingMessage ? (
            <div
              className={
                bookingSuccess
                  ? "booking-feedback success"
                  : "booking-feedback"
              }
            >
              {bookingMessage}
            </div>
          ) : null}

          <small className="form-note">
            الحجز يتم داخل الموقع — بدون تحويل إلى WhatsApp
          </small>
        </form>
      </section>

      <section className="instructor">
        <div className="instructor-copy">
          <span>
            مقدّم الكورس
          </span>

          <h2>
            ADAM DESIGN
          </h2>

          <p>
            راح أشارك وياكم طريقة شغلي
            خطوة بخطوة: من Photoshop
            وتعديل الألوان إلى After Effects،
            الصوت، واستخدام الذكاء الاصطناعي
            داخل Workflow المونتاج.
          </p>
        </div>

        <div className="instructor-photo">
          <div className="instructor-glow" />

          <img
            src="/hero-person.png"
            alt="Adam Design"
          />
        </div>
      </section>

      <footer>
        <span>
          ADAM DESIGN
        </span>

        <small>
          DENTAL EDITING COURSE
        </small>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .course-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          color: #fff;
          background: #020711;
        }

        .course-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .grid {
          position: absolute;
          inset: 0;
          opacity: .22;
          background-image:
            linear-gradient(
              rgba(255,255,255,.025)
              1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.025)
              1px,
              transparent 1px
            );
          background-size: 48px 48px;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
        }

        .glow-a {
          width: 420px;
          height: 420px;
          top: 80px;
          right: -160px;
          background: rgba(0,140,255,.14);
        }

        .glow-b {
          width: 360px;
          height: 360px;
          left: -170px;
          top: 620px;
          background: rgba(93,65,255,.10);
        }

        .course-nav,
        .hero,
        .learning-section,
        .journey,
        .reserve-section,
        .instructor,
        footer {
          position: relative;
          z-index: 2;
        }

        .course-nav {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }

        .back-button {
          padding: 9px 12px;
          color: rgba(255,255,255,.55);
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.08);
          cursor: pointer;
          font-size: 9px;
        }

        .brand {
          color: #65c7ff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
        }

        .hero {
          width: min(1180px, calc(100% - 32px));
          min-height: 680px;
          margin: 0 auto;
          padding: 70px 0 56px;
          display: grid;
          grid-template-columns:
            minmax(0,1.1fr)
            minmax(300px,.9fr);
          gap: 60px;
          align-items: center;
        }

        .hero-copy {
          text-align: right;
        }

        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: rgba(255,255,255,.55);
          font-size: 10px;
          font-weight: 800;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #56c4ff;
          animation: pulse 1.8s infinite;
        }

        .title-wrap {
          position: relative;
          width: fit-content;
          margin-top: 20px;
        }

        .coming {
          position: absolute;
          top: -12px;
          left: -30px;
          z-index: 2;
          color: #82d4ff;
          font-family: Georgia, serif;
          font-size: clamp(22px,2.4vw,32px);
          font-style: italic;
          transform: rotate(-7deg);
          text-shadow: 0 0 22px rgba(90,196,255,.32);
          animation: floatText 3.2s ease-in-out infinite;
        }

        h1 {
          margin: 0;
          direction: ltr;
          text-align: left;
          color: #fff;
          font-family: Impact, "Arial Narrow", sans-serif;
          font-size: clamp(72px,8vw,124px);
          line-height: .82;
          letter-spacing: -.02em;
          font-weight: 900;
        }

        h1 b {
          color: transparent;
          background:
            linear-gradient(
              90deg,
              #4bb8ff,
              #b5e7ff,
              #4bb8ff
            );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3.8s linear infinite;
        }

        .rotating-copy {
          position: relative;
          width: min(100%,430px);
          height: 32px;
          margin-top: 26px;
          overflow: hidden;
          border-right: 1px solid rgba(92,193,255,.48);
        }

        .rotating-copy span {
          position: absolute;
          inset: 0 0 auto 0;
          color: #84d1ff;
          font-size: 14px;
          font-weight: 800;
          opacity: 0;
          transform: translateY(13px);
          animation: rotateCopy 9s infinite;
        }

        .rotating-copy span:nth-child(2) {
          animation-delay: 3s;
        }

        .rotating-copy span:nth-child(3) {
          animation-delay: 6s;
        }

        .lead {
          max-width: 650px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.53);
          font-size: 13px;
          line-height: 2.05;
        }

        .hero-cta {
          width: min(100%,430px);
          margin-top: 24px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #07111d;
          text-decoration: none;
          background:
            linear-gradient(
              100deg,
              #58c0ff,
              #a1dfff,
              #58c0ff
            );
          background-size: 200% auto;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 900;
          animation: buttonShine 3.4s linear infinite;
        }

        .hero-cta b {
          font-size: 18px;
        }

        .hero-visual {
          position: relative;
          min-height: 500px;
          display: grid;
          place-items: center;
        }

        .visual-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(90,190,255,.12);
        }

        .ring-one {
          width: 360px;
          height: 360px;
          animation: spin 24s linear infinite;
        }

        .ring-two {
          width: 470px;
          height: 470px;
          border-color: rgba(119,92,255,.08);
          animation: spinReverse 30s linear infinite;
        }

        .course-poster-shell {
          position: relative;
          z-index: 2;

          width:
            min(
              100%,
              420px
            );

          aspect-ratio: 1 / 1;

          padding: 3px;

          border-radius: 26px;

          overflow: hidden;

          filter:
            drop-shadow(
              0 30px 70px
              rgba(0,0,0,.48)
            );

          animation:
            posterFloat
            5.4s
            ease-in-out
            infinite;
        }

        .course-poster-border {
          position: absolute;
          inset: -55%;

          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 220deg,
              rgba(71,181,255,.15) 245deg,
              #60c8ff 278deg,
              #d6f3ff 300deg,
              #4d8dff 322deg,
              transparent 345deg,
              transparent 360deg
            );

          animation:
            posterBorderLoop
            3.8s
            linear
            infinite;
        }

        .course-poster-shell::after {
          content: "";

          position: absolute;
          inset: 0;

          z-index: 1;

          border-radius: 26px;

          box-shadow:
            inset 0 0 0 1px
            rgba(112,205,255,.20),
            0 0 24px
            rgba(62,179,255,.12);

          pointer-events: none;

          animation:
            posterOuterGlow
            2.7s
            ease-in-out
            infinite;
        }

        .course-poster-inner {
          position: relative;
          z-index: 2;

          width: 100%;
          height: 100%;

          overflow: hidden;

          border-radius: 23px;

          background: #020711;
        }

        .course-poster-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transform:
            scale(1.003);
        }

        .course-poster-shine {
          position: absolute;

          top: -25%;
          bottom: -25%;

          left: -45%;

          width: 24%;

          transform:
            rotate(14deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.14),
              transparent
            );

          filter: blur(2px);

          animation:
            posterShineLoop
            4.8s
            ease-in-out
            infinite;

          pointer-events: none;
        }

        .course-poster-status {
          position: absolute;

          left: 15px;
          bottom: 15px;

          padding:
            8px 11px;

          display: inline-flex;
          align-items: center;

          gap: 8px;

          color: #e9f8ff;

          background:
            rgba(1,10,24,.78);

          border:
            1px solid
            rgba(101,199,255,.30);

          border-radius: 999px;

          backdrop-filter:
            blur(12px);

          font-size: 7px;
          font-weight: 900;

          letter-spacing: .16em;

          box-shadow:
            0 8px 26px
            rgba(0,0,0,.28);
        }

        .learning-section {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 70px 0;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 28px;
        }

        .section-heading > div > span {
          color: #64c7ff;
          font-size: 9px;
          font-weight: 900;
        }

        .section-heading h2 {
          margin: 8px 0 0;
          color: #fff;
          font-family: Georgia, serif;
          font-size: clamp(36px,5vw,62px);
          line-height: 1.12;
          font-weight: 400;
        }

        .section-heading h2 b {
          color: #65c8ff;
          font-weight: 400;
        }

        .section-heading > p {
          max-width: 520px;
          margin: 0;
          color: rgba(255,255,255,.43);
          font-size: 11px;
          line-height: 1.95;
        }

        .learning-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 12px;
        }

        .learning-grid article {
          position: relative;
          min-height: 190px;
          padding: 20px;
          overflow: hidden;
          background: rgba(255,255,255,.026);
          border: 1px solid rgba(92,191,255,.10);
          border-radius: 16px;
          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease;
        }

        .learning-grid article::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          left: -60px;
          bottom: -70px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(57,171,255,.11),
              transparent 70%
            );
        }

        .learning-grid article:hover {
          transform: translateY(-5px);
          border-color: rgba(92,191,255,.34);
          background: rgba(56,167,255,.045);
        }

        .learning-grid article > span {
          display: block;
          margin-bottom: 18px;
          color: #c7a85d;
          font-size: 8px;
          letter-spacing: .16em;
        }

        .learning-grid article strong {
          display: block;
          color: #fff;
          font-size: 15px;
        }

        .learning-grid article p {
          margin: 10px 0 0;
          color: rgba(255,255,255,.43);
          font-size: 10px;
          line-height: 1.9;
        }

        .journey {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 28px;
          background:
            linear-gradient(
              120deg,
              rgba(70,180,255,.06),
              rgba(255,255,255,.012)
            );
          border: 1px solid rgba(79,184,255,.12);
          border-radius: 18px;
        }

        .journey-label {
          display: block;
          margin-bottom: 22px;
          color: #65c8ff;
          font-size: 9px;
          font-weight: 900;
        }

        .journey-track {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            auto
            minmax(0,1fr)
            auto
            minmax(0,1fr)
            auto
            minmax(0,1fr);
          gap: 14px;
          align-items: center;
        }

        .journey-track > div {
          padding: 14px;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 13px;
        }

        .journey-track > div span {
          display: block;
          color: #c7a85d;
          font-size: 7px;
        }

        .journey-track > div strong {
          display: block;
          margin-top: 5px;
          color: #fff;
          font-size: 13px;
        }

        .journey-track > div p {
          margin: 5px 0 0;
          color: rgba(255,255,255,.35);
          font-size: 8px;
        }

        .journey-track > i {
          color: rgba(101,199,255,.40);
          font-style: normal;
        }

        .reserve-section {
          width: min(980px, calc(100% - 32px));
          margin: 90px auto;
          padding: 38px;
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            minmax(300px,.78fr);
          gap: 38px;
          align-items: center;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 100% 0,
              rgba(68,182,255,.10),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              rgba(7,24,47,.96),
              rgba(2,9,20,.98)
            );
          border: 1px solid rgba(94,188,255,.22);
          border-radius: 24px;
          box-shadow: 0 30px 90px rgba(0,0,0,.34);
        }

        .reserve-copy > span {
          display: block;
          margin-bottom: 8px;
          color: #65c8ff;
          direction: ltr;
          text-align: right;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .18em;
        }

        .reserve-copy h2 {
          margin: 0;
          color: #fff;
          font-family: Georgia, serif;
          font-size: clamp(33px,4vw,50px);
          line-height: 1.25;
          font-weight: 400;
        }

        .reserve-copy h2 b {
          color: #68caff;
          font-weight: 400;
        }

        .reserve-copy > p {
          margin: 14px 0 0;
          color: rgba(255,255,255,.43);
          font-size: 11px;
          line-height: 1.95;
        }

        .no-payment {
          margin-top: 20px;
          padding: 13px;
          display: grid;
          grid-template-columns: 32px minmax(0,1fr);
          gap: 10px;
          align-items: center;
          background:
            linear-gradient(
              90deg,
              rgba(39,203,108,.065),
              rgba(39,203,108,.02)
            );
          border: 1px solid rgba(39,203,108,.16);
          border-radius: 13px;
        }

        .no-payment > span {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #8febb5;
          background: rgba(39,203,108,.10);
        }

        .no-payment strong {
          display: block;
          color: #96edba;
          font-size: 10px;
        }

        .no-payment small {
          display: block;
          margin-top: 3px;
          color: rgba(255,255,255,.32);
          font-size: 8px;
          line-height: 1.55;
        }

        .waitlist-counter {
          margin-top: 12px;
          padding: 13px;
          display: grid;
          grid-template-columns: 36px minmax(0,1fr);
          gap: 11px;
          align-items: center;
          background:
            linear-gradient(
              90deg,
              rgba(85,195,255,.07),
              rgba(85,195,255,.018)
            );
          border: 1px solid rgba(85,195,255,.16);
          border-radius: 13px;
        }

        .waitlist-counter-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #79d0ff;
          background: rgba(85,195,255,.08);
          border: 1px solid rgba(85,195,255,.14);
          animation: pulse 1.8s infinite;
        }

        .waitlist-counter strong {
          display: block;
          color: #dff5ff;
          font-size: 10px;
        }

        .waitlist-counter small {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,.30);
          font-size: 7px;
          line-height: 1.5;
        }

        .reserve-form {
          display: grid;
          gap: 13px;
        }

        .reserve-form label > span {
          display: block;
          margin-bottom: 6px;
          color: rgba(255,255,255,.43);
          font-size: 8px;
          font-weight: 800;
        }

        .reserve-form input {
          width: 100%;
          height: 48px;
          padding: 0 13px;
          color: #fff;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 11px;
          outline: none;
          font-size: 11px;
        }

        .reserve-form input:focus {
          border-color: rgba(80,185,255,.52);
          box-shadow: 0 0 0 3px rgba(80,185,255,.045);
        }

        .reserve-form input::placeholder {
          color: rgba(255,255,255,.22);
        }

        .reserve-form button {
          height: 52px;
          margin-top: 3px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #06111d;
          background:
            linear-gradient(
              100deg,
              #58c0ff,
              #a1dfff,
              #58c0ff
            );
          background-size: 200% auto;
          border: 0;
          border-radius: 12px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
          animation: buttonShine 3.4s linear infinite;
        }

        .reserve-form button b {
          font-size: 20px;
        }

        .booking-feedback {
          padding: 11px 12px;
          color: #ffd79a;
          background: rgba(255,183,77,.055);
          border: 1px solid rgba(255,183,77,.16);
          border-radius: 10px;
          font-size: 9px;
          line-height: 1.6;
          text-align: center;
        }

        .booking-feedback.success {
          color: #9aefbd;
          background: rgba(39,203,108,.055);
          border-color: rgba(39,203,108,.18);
        }

        .reserve-form button:disabled {
          cursor: wait;
          opacity: .72;
          transform: none;
        }

        .form-note {
          display: block;
          color: rgba(255,255,255,.27);
          font-size: 7px;
          text-align: center;
        }

        .instructor {
          width: min(1180px, calc(100% - 32px));
          min-height: 340px;
          margin: 0 auto;
          padding: 0 60px;
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            300px;
          gap: 50px;
          align-items: end;
          overflow: hidden;
          background:
            linear-gradient(
              90deg,
              rgba(0,143,255,.055),
              transparent 58%
            ),
            rgba(255,255,255,.012);
          border-top: 1px solid rgba(87,188,255,.12);
          border-bottom: 1px solid rgba(87,188,255,.08);
        }

        .instructor-copy {
          align-self: center;
          padding: 45px 0;
        }

        .instructor-copy > span {
          display: block;
          margin-bottom: 9px;
          color: #64c6ff;
          font-size: 8px;
          font-weight: 900;
        }

        .instructor-copy h2 {
          margin: 0;
          color: #fff;
          direction: ltr;
          text-align: right;
          font-family: Impact, "Arial Narrow", sans-serif;
          font-size: clamp(44px,5vw,70px);
          letter-spacing: .02em;
        }

        .instructor-copy p {
          max-width: 620px;
          margin: 13px 0 0;
          color: rgba(255,255,255,.43);
          font-size: 11px;
          line-height: 1.95;
        }

        .instructor-photo {
          position: relative;
          height: 340px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .instructor-glow {
          position: absolute;
          width: 270px;
          height: 270px;
          bottom: 12px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(56,180,255,.23),
              transparent 67%
            );
          filter: blur(12px);
          animation: orb 5.5s ease-in-out infinite;
        }

        .instructor-photo img {
          position: relative;
          z-index: 2;
          max-width: 285px;
          max-height: 335px;
          object-fit: contain;
          object-position: bottom;
          filter: drop-shadow(0 22px 45px rgba(0,0,0,.42));
        }

        footer {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 30px 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255,255,255,.28);
        }

        footer span {
          color: rgba(255,255,255,.48);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .15em;
        }

        footer small {
          font-size: 8px;
          letter-spacing: .12em;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(81,195,255,.42);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(81,195,255,0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(81,195,255,0);
          }
        }

        @keyframes shine {
          to {
            background-position: 220% center;
          }
        }

        @keyframes rotateCopy {
          0% {
            opacity: 0;
            transform: translateY(13px);
          }
          8%,25% {
            opacity: 1;
            transform: translateY(0);
          }
          33%,100% {
            opacity: 0;
            transform: translateY(-13px);
          }
        }

        @keyframes floatText {
          0%,100% {
            transform: rotate(-7deg) translateY(0);
          }
          50% {
            transform: rotate(-7deg) translateY(-5px);
          }
        }

        @keyframes buttonShine {
          to {
            background-position: 200% center;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes posterFloat {
          0%,
          100% {
            transform:
              translateY(0)
              rotate(.35deg);
          }

          50% {
            transform:
              translateY(-9px)
              rotate(-.25deg);
          }
        }

        @keyframes posterBorderLoop {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes posterOuterGlow {
          0%,
          100% {
            box-shadow:
              inset 0 0 0 1px
              rgba(112,205,255,.18),
              0 0 20px
              rgba(62,179,255,.10);
          }

          50% {
            box-shadow:
              inset 0 0 0 1px
              rgba(179,230,255,.32),
              0 0 38px
              rgba(62,179,255,.22);
          }
        }

        @keyframes posterShineLoop {
          0%,
          58% {
            left: -45%;
            opacity: 0;
          }

          64% {
            opacity: .85;
          }

          84% {
            left: 125%;
            opacity: .72;
          }

          100% {
            left: 125%;
            opacity: 0;
          }
        }

        @keyframes orb {
          0%,100% {
            opacity: .5;
            transform: scale(.95);
          }
          50% {
            opacity: .95;
            transform: scale(1.05);
          }
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .hero-copy {
            text-align: center;
          }

          .kicker {
            justify-content: center;
          }

          .title-wrap,
          .rotating-copy,
          .lead,
          .hero-cta {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-visual {
            min-height: 440px;
          }

          .learning-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .reserve-section {
            grid-template-columns: 1fr;
          }

          .instructor {
            padding: 0 28px;
          }
        }

        @media (max-width: 650px) {
          .course-nav,
          .hero,
          .learning-section,
          .journey,
          .instructor,
          footer {
            width: calc(100% - 20px);
          }

          .hero {
            min-height: auto;
            padding: 55px 0 42px;
          }

          h1 {
            font-size: clamp(62px,22vw,92px);
          }

          .coming {
            left: -10px;
          }

          .hero-visual {
            min-height: 390px;
          }

          .course-poster-shell {
            width:
              min(
                100%,
                350px
              );
          }

          .ring-one {
            width: 300px;
            height: 300px;
          }

          .ring-two {
            width: 370px;
            height: 370px;
          }

          .learning-section {
            padding: 52px 0;
          }

          .section-heading {
            display: block;
            text-align: center;
          }

          .section-heading > p {
            margin: 18px auto 0;
          }

          .learning-grid {
            grid-template-columns: 1fr;
          }

          .journey {
            padding: 20px;
          }

          .journey-track {
            grid-template-columns: 1fr;
          }

          .journey-track > i {
            transform: rotate(90deg);
            text-align: center;
          }

          .reserve-section {
            width: calc(100% - 20px);
            margin: 60px auto;
            padding: 24px 18px;
          }

          .instructor {
            min-height: auto;
            padding: 34px 18px 0;
            grid-template-columns: 1fr;
            gap: 0;
            text-align: center;
          }

          .instructor-copy {
            padding: 0;
          }

          .instructor-copy h2 {
            text-align: center;
          }

          .instructor-copy p {
            margin-left: auto;
            margin-right: auto;
          }

          .instructor-photo {
            height: 270px;
            margin-top: 18px;
          }

          .instructor-photo img {
            max-height: 265px;
          }

          footer {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .live-dot,
          h1 b,
          .rotating-copy span,
          .coming,
          .hero-cta,
          .visual-ring,
          .course-poster-shell,
          .course-poster-border,
          .course-poster-shine,
          .reserve-form button,
          .instructor-glow {
            animation: none !important;
          }

          .rotating-copy {
            height: auto;
            border-right: 0;
          }

          .rotating-copy span {
            position: static;
            display: block;
            opacity: 1;
            transform: none;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </main>
  );
}
