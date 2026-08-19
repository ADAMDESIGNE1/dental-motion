"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DoctorLoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] =
    useState(false);

  const [fullName, setFullName] =
    useState("");

  const [specialty, setSpecialty] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * الرابط الذي نرجع له بعد Login
   *
   * مثال:
   * /doctor-login?redirect=%2Fsubscription%3Fplan%3Dbasic
   */

  const [redirectPath, setRedirectPath] =
    useState("/doctor-dashboard");

  /*
   * =====================================================
   * READ REDIRECT
   * =====================================================
   */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const redirect =
      params.get("redirect");

    if (
      redirect &&
      redirect.startsWith("/")
    ) {
      setRedirectPath(redirect);
    }
  }, []);

  /*
   * =====================================================
   * SUBMIT
   * =====================================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      /*
       * =================================================
       * REGISTER
       * =================================================
       */

      if (isRegister) {
        if (!fullName.trim()) {
          setError(
            "يرجى كتابة اسم الطبيب."
          );
          setLoading(false);
          return;
        }

        if (!specialty.trim()) {
          setError(
            "يرجى كتابة الاختصاص."
          );
          setLoading(false);
          return;
        }

        if (!email.trim()) {
          setError(
            "يرجى كتابة البريد الإلكتروني."
          );
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError(
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
          );
          setLoading(false);
          return;
        }

        /*
         * CREATE AUTH USER
         */

        const {
          data,
          error: signUpError,
        } =
          await supabase.auth.signUp({
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          });

        if (signUpError) {
          console.error(
            "SIGN UP ERROR:",
            signUpError
          );

          setError(
            signUpError.message
          );

          setLoading(false);
          return;
        }

        if (!data.user) {
          setError(
            "تعذر إنشاء الحساب."
          );

          setLoading(false);
          return;
        }

        /*
         * CREATE DOCTOR PROFILE
         */

        const {
          data: existingDoctor,
          error:
            existingDoctorError,
        } = await supabase
          .from("doctors")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (existingDoctorError) {
          setError(
            existingDoctorError.message
          );

          setLoading(false);
          return;
        }

        if (!existingDoctor) {
          const {
            error:
              doctorInsertError,
          } = await supabase
            .from("doctors")
            .insert({
              id: data.user.id,

              full_name:
                fullName.trim(),

              specialty:
                specialty.trim(),

              subscription_active:
                false,

              is_approved:
                false,
            });

          if (doctorInsertError) {
            console.error(
              "DOCTOR INSERT ERROR:",
              doctorInsertError
            );

            setError(
              "تم إنشاء حساب الدخول، لكن تعذر إنشاء ملف الطبيب: " +
                doctorInsertError.message
            );

            setLoading(false);
            return;
          }
        }

        /*
         * بعد التسجيل:
         *
         * إذا Supabase عنده Email Confirmation
         * قد لا تكون Session موجودة.
         *
         * لذلك نطلب من الطبيب تسجيل الدخول.
         */

        setMessage(
          "تم إنشاء حساب الطبيب بنجاح. يمكنك الآن تسجيل الدخول."
        );

        setIsRegister(false);
        setPassword("");

        setLoading(false);
        return;
      }

      /*
       * =================================================
       * LOGIN
       * =================================================
       */

      if (!email.trim()) {
        setError(
          "يرجى كتابة البريد الإلكتروني."
        );

        setLoading(false);
        return;
      }

      if (!password) {
        setError(
          "يرجى كتابة كلمة المرور."
        );

        setLoading(false);
        return;
      }

      /*
       * SIGN IN
       */

      const {
        data: loginData,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          }
        );

      if (loginError) {
        console.error(
          "LOGIN ERROR:",
          loginError
        );

        setError(
          "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        );

        setLoading(false);
        return;
      }

      if (!loginData.user) {
        setError(
          "تعذر تسجيل الدخول."
        );

        setLoading(false);
        return;
      }

      /*
       * =================================================
       * VERIFY SESSION
       * =================================================
       */

      const {
        data: {
          session,
        },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !session
      ) {
        setError(
          "تم تسجيل الدخول لكن لم يتم إنشاء الجلسة. حاول مرة أخرى."
        );

        setLoading(false);
        return;
      }

      /*
       * =================================================
       * VERIFY DOCTOR PROFILE
       * =================================================
       */

      const {
        data: doctor,
        error: doctorError,
      } =
        await supabase
          .from("doctors")
          .select(
            "id, full_name"
          )
          .eq(
            "id",
            session.user.id
          )
          .maybeSingle();

      if (doctorError) {
        console.error(
          "DOCTOR CHECK ERROR:",
          doctorError
        );

        setError(
          "تعذر قراءة ملف الطبيب: " +
            doctorError.message
        );

        setLoading(false);
        return;
      }

      /*
       * إذا الحساب موجود في Auth
       * لكن ما عنده doctors profile
       */

      if (!doctor) {
        setError(
          "هذا الحساب لا يملك ملف طبيب. يرجى إنشاء حساب طبيب جديد."
        );

        await supabase.auth.signOut();

        setLoading(false);
        return;
      }

      /*
       * =================================================
       * SUCCESS
       * =================================================
       */

      setMessage(
        "تم تسجيل الدخول بنجاح..."
      );

      /*
       * مهم:
       *
       * إذا جاء من subscription
       * يرجع إلى subscription.
       *
       * وإلا يذهب إلى dashboard.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 400)
      );

      router.replace(
        redirectPath
      );
    } catch (err) {
      console.error(
        "DOCTOR LOGIN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ غير متوقع. حاول مرة أخرى."
      );

      setLoading(false);
    }
  };

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",

        background:
          "radial-gradient(circle at 50% 20%, rgba(0,140,255,0.12), transparent 35%), #020409",

        color: "#f4f1e9",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "30px 16px",

        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",

          maxWidth: "520px",

          background:
            "rgba(3,8,18,0.86)",

          border:
            "1px solid rgba(0,140,255,0.25)",

          padding:
            "42px 30px",

          boxShadow:
            "0 0 60px rgba(0,100,255,0.10)",

          backdropFilter:
            "blur(15px)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              color: "#c7a85d",
              fontSize: "10px",
              letterSpacing:
                "0.25em",
              marginBottom: "14px",
            }}
          >
            DENTAL MOTION
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily:
                "Georgia, serif",
              fontSize: "42px",
              fontWeight: 400,
            }}
          >
            {isRegister
              ? "تسجيل طبيب"
              : "دخول الطبيب"}
          </h1>

          <p
            style={{
              color:
                "rgba(255,255,255,0.48)",
              fontSize: "12px",
              lineHeight: 1.8,
              marginTop: "15px",
            }}
          >
            {isRegister
              ? "أنشئ ملفك الطبي وابدأ بإضافة معلوماتك وشهاداتك وخدماتك."
              : redirectPath.startsWith(
                  "/subscription"
                )
              ? "سجل الدخول حتى تتمكن من إكمال طلب الاشتراك."
              : "ادخل إلى حسابك لإدارة ملفك ومعلوماتك المهنية."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          {isRegister && (
            <>
              <label
                style={labelStyle}
              >
                اسم الطبيب
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                placeholder="مثال: د. محمد أحمد"
                style={inputStyle}
              />

              <label
                style={labelStyle}
              >
                الاختصاص
              </label>

              <input
                type="text"
                value={specialty}
                onChange={(e) =>
                  setSpecialty(
                    e.target.value
                  )
                }
                placeholder="مثال: طب الأسنان التجميلي"
                style={inputStyle}
              />
            </>
          )}

          <label
            style={labelStyle}
          >
            البريد الإلكتروني
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="doctor@example.com"
            autoComplete="email"
            style={inputStyle}
            required
          />

          <label
            style={labelStyle}
          >
            كلمة المرور
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="••••••••"
            autoComplete={
              isRegister
                ? "new-password"
                : "current-password"
            }
            style={inputStyle}
            required
          />

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                border:
                  "1px solid rgba(255,70,70,0.35)",
                background:
                  "rgba(255,40,40,0.08)",
                color: "#ff9b9b",
                fontSize: "11px",
                lineHeight: 1.7,
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                border:
                  "1px solid rgba(0,180,255,0.3)",
                background:
                  "rgba(0,140,255,0.08)",
                color: "#7dccff",
                fontSize: "11px",
                lineHeight: 1.7,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "15px",
              background:
                loading
                  ? "rgba(0,140,255,0.35)"
                  : "#008cff",
              color: "#fff",
              border:
                "1px solid rgba(0,180,255,0.7)",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              fontSize: "11px",
              letterSpacing:
                "0.12em",
            }}
          >
            {loading
              ? "جاري المعالجة..."
              : isRegister
              ? "إنشاء حساب الطبيب"
              : "دخول"}
          </button>
        </form>

        <div
          style={{
            marginTop: "28px",
            paddingTop: "22px",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color:
                "rgba(255,255,255,0.4)",
              fontSize: "10px",
            }}
          >
            {isRegister
              ? "لديك حساب بالفعل؟"
              : "ليس لديك حساب؟"}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsRegister(
                !isRegister
              );

              setError("");
              setMessage("");
            }}
            style={{
              display: "block",
              margin:
                "10px auto 0",
              background:
                "transparent",
              border: 0,
              color: "#32baff",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            {isRegister
              ? "تسجيل الدخول"
              : "إنشاء حساب جديد"}
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          style={{
            display: "block",
            margin:
              "25px auto 0",
            background:
              "transparent",
            border: 0,
            color:
              "rgba(255,255,255,0.3)",
            cursor: "pointer",
            fontSize: "9px",
            letterSpacing:
              "0.12em",
          }}
        >
          العودة إلى الصفحة الرئيسية
        </button>
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  marginTop: "18px",
  color: "#c7a85d",
  fontSize: "10px",
  letterSpacing: "0.08em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  background:
    "rgba(0,0,0,0.35)",
  color: "#fff",
  border:
    "1px solid rgba(0,140,255,0.18)",
  outline: "none",
  fontSize: "12px",
  direction: "rtl",
};