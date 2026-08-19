"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

type ApprovedRequest = {
  request_id: string;
  doctor_name: string | null;
  whatsapp_number: string | null;
  plan: string;
  duration_days: number;
  registration_expires_at: string;
};

export default function RegisterFromApprovalPage() {
  const router = useRouter();

  const params = useParams<{
    token: string;
  }>();

  const token =
    typeof params?.token === "string"
      ? params.token
      : "";

  const [request, setRequest] =
    useState<ApprovedRequest | null>(
      null
    );

  const [loadingRequest, setLoadingRequest] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [mode, setMode] =
    useState<
      "register" | "login"
    >("register");

  const [fullName, setFullName] =
    useState("");

  const [specialty, setSpecialty] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRequest() {
      setLoadingRequest(true);
      setError("");

      try {
        if (!token) {
          throw new Error(
            "رابط التسجيل غير صحيح."
          );
        }

        const {
          data,
          error: requestError,
        } = await supabase.rpc(
          "get_approved_registration_request",
          {
            token_text: token,
          }
        );

        if (requestError) {
          throw new Error(
            requestError.message
          );
        }

        const row =
          Array.isArray(data)
            ? data[0]
            : data;

        if (!row) {
          throw new Error(
            "رابط التسجيل غير صالح أو منتهي أو تم استخدامه مسبقاً."
          );
        }

        if (!mounted) return;

        const approved =
          row as ApprovedRequest;

        setRequest(approved);

        if (
          approved.doctor_name
        ) {
          setFullName(
            approved.doctor_name
          );
        }
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "تعذر قراءة رابط التسجيل."
        );
      } finally {
        if (mounted) {
          setLoadingRequest(false);
        }
      }
    }

    loadRequest();

    return () => {
      mounted = false;
    };
  }, [token]);

  async function completeRegistration() {
    const {
      data: sessionData,
      error: sessionError,
    } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(
        sessionError.message
      );
    }

    const user =
      sessionData.session?.user;

    if (!user) {
      throw new Error(
        "لا توجد جلسة دخول للطبيب."
      );
    }

    const {
      data,
      error: completeError,
    } = await supabase.rpc(
      "complete_subscription_registration",
      {
        token_text: token,
        doctor_full_name:
          fullName.trim(),
        doctor_specialty:
          specialty.trim(),
      }
    );

    if (completeError) {
      throw new Error(
        completeError.message
      );
    }

    if (data !== true) {
      throw new Error(
        "تعذر إكمال ربط الاشتراك."
      );
    }

    setMessage(
      "تم إنشاء حسابك وتفعيل اشتراكك بنجاح. جاري فتح لوحة الطبيب..."
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          800
        )
    );

    router.replace(
      "/doctor-dashboard"
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (!request) {
        throw new Error(
          "طلب الاشتراك غير متوفر."
        );
      }

      if (
        !fullName.trim()
      ) {
        throw new Error(
          "اكتب اسم الطبيب."
        );
      }

      if (
        !specialty.trim()
      ) {
        throw new Error(
          "اكتب اختصاص الطبيب."
        );
      }

      if (!email.trim()) {
        throw new Error(
          "اكتب البريد الإلكتروني."
        );
      }

      if (
        password.length < 6
      ) {
        throw new Error(
          "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
        );
      }

      if (
        mode === "register"
      ) {
        const {
          data,
          error:
            signUpError,
        } =
          await supabase.auth.signUp(
            {
              email: email
                .trim()
                .toLowerCase(),

              password,
            }
          );

        if (signUpError) {
  const msg =
    signUpError.message.toLowerCase();

  if (
    msg.includes("already registered") ||
    msg.includes("already exists")
  ) {
    setMode("login");

    setMessage(
      "هذا البريد مسجل مسبقاً. أدخل كلمة المرور واضغط تسجيل الدخول وإكمال الاشتراك."
    );

    setSubmitting(false);
    return;
  }

  throw new Error(
    signUpError.message
  );
}

        if (!data.user) {
          throw new Error(
            "تعذر إنشاء حساب الطبيب."
          );
        }

        /*
         * إذا Supabase أنشأ Session مباشرة
         * نكمل ربط الاشتراك.
         */

        if (data.session) {
          await completeRegistration();
          return;
        }

        /*
         * إذا Email Confirmation مفعّل
         * ما راح تكون Session موجودة.
         */

        setMode("login");

        setMessage(
          "تم إنشاء الحساب. إذا وصلك بريد تأكيد من Supabase، افتحه وأكد البريد، ثم ارجع لهذه الصفحة واضغط تسجيل الدخول وإكمال الاشتراك."
        );

        return;
      }

      /*
       * LOGIN AFTER EMAIL CONFIRMATION
       */

      const {
        data:
          loginData,
        error:
          loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: email
              .trim()
              .toLowerCase(),

            password,
          }
        );

      if (loginError) {
        throw new Error(
          "تعذر تسجيل الدخول. إذا كان تأكيد البريد مفعلاً، تأكد من البريد أولاً."
        );
      }

      if (
        !loginData.session
      ) {
        throw new Error(
          "تم تسجيل الدخول لكن لم يتم إنشاء جلسة."
        );
      }

      await completeRegistration();
    } catch (err) {
      console.error(
        "REGISTER FROM TOKEN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء التسجيل."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingRequest) {
    return (
      <main
        dir="rtl"
        style={pageStyle}
      >
        <div
          style={cardStyle}
        >
          جاري التحقق من رابط التسجيل...
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main
        dir="rtl"
        style={pageStyle}
      >
        <div
          style={cardStyle}
        >
          <div
            style={errorBox}
          >
            {error ||
              "رابط التسجيل غير صالح."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      style={pageStyle}
    >
      <section
        style={cardStyle}
      >
        <div
          style={brandStyle}
        >
          ADAM DESIGN
        </div>

        <h1
          style={titleStyle}
        >
          إكمال تسجيل الطبيب
        </h1>

        <p
          style={subtitleStyle}
        >
          تمت الموافقة على طلب
          اشتراكك. أكمل إنشاء
          حسابك حتى تتمكن من
          إدارة ملفك الطبي
          وصفحتك الخاصة.
        </p>

        <div
          style={
            requestInfoStyle
          }
        >
          <div>
            <span
              style={
                infoLabel
              }
            >
              الطبيب
            </span>

            <strong>
              {request.doctor_name ||
                "غير محدد"}
            </strong>
          </div>

          <div>
            <span
              style={
                infoLabel
              }
            >
              الباقة
            </span>

            <strong>
              {request.plan}
            </strong>
          </div>

          <div>
            <span
              style={
                infoLabel
              }
            >
              المدة
            </span>

            <strong>
              {
                request.duration_days
              }{" "}
              يوم
            </strong>
          </div>
        </div>

        {message && (
          <div
            style={
              successBox
            }
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={errorBox}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
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
              mode ===
              "register"
                ? "new-password"
                : "current-password"
            }
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={
              submitting
            }
            style={{
              ...submitButton,
              opacity:
                submitting
                  ? 0.6
                  : 1,
            }}
          >
            {submitting
              ? "جاري المعالجة..."
              : mode ===
                  "register"
                ? "إنشاء الحساب وتفعيل الاشتراك"
                : "تسجيل الدخول وإكمال الاشتراك"}
          </button>
        </form>
      </section>
    </main>
  );
}

const pageStyle:
  React.CSSProperties = {
  minHeight: "100vh",

  background:
    "radial-gradient(circle at 50% 10%, rgba(0,140,255,.14), transparent 35%), #020409",

  color: "#fff",

  padding:
    "40px 16px",

  display: "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  fontFamily:
    "Arial, sans-serif",
};

const cardStyle:
  React.CSSProperties = {
  width: "100%",

  maxWidth: 560,

  padding: 32,

  boxSizing:
    "border-box",

  background:
    "rgba(3,8,18,.95)",

  border:
    "1px solid rgba(0,140,255,.2)",
};

const brandStyle:
  React.CSSProperties = {
  color: "#c7a85d",

  fontSize: 10,

  letterSpacing:
    ".2em",
};

const titleStyle:
  React.CSSProperties = {
  fontFamily:
    "Georgia, serif",

  fontWeight: 400,

  fontSize: 34,

  margin:
    "10px 0",
};

const subtitleStyle:
  React.CSSProperties = {
  color:
    "rgba(255,255,255,.48)",

  lineHeight: 1.9,

  fontSize: 12,
};

const requestInfoStyle:
  React.CSSProperties = {
  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(120px,1fr))",

  gap: 10,

  margin:
    "22px 0",

  padding: 14,

  background:
    "rgba(0,140,255,.05)",

  border:
    "1px solid rgba(0,140,255,.12)",
};

const infoLabel:
  React.CSSProperties = {
  display: "block",

  color: "#c7a85d",

  fontSize: 9,

  marginBottom: 6,
};

const labelStyle:
  React.CSSProperties = {
  display: "block",

  color: "#c7a85d",

  marginTop: 18,

  marginBottom: 7,

  fontSize: 10,
};

const inputStyle:
  React.CSSProperties = {
  width: "100%",

  boxSizing:
    "border-box",

  padding: 14,

  background:
    "rgba(0,0,0,.35)",

  color: "#fff",

  border:
    "1px solid rgba(0,140,255,.2)",

  outline: "none",

  fontSize: 13,
};

const submitButton:
  React.CSSProperties = {
  width: "100%",

  marginTop: 25,

  padding: 15,

  background:
    "#008cff",

  color: "#fff",

  border: 0,

  cursor:
    "pointer",

  fontSize: 13,
};

const successBox:
  React.CSSProperties = {
  padding: 12,

  marginTop: 15,

  background:
    "rgba(0,200,120,.08)",

  border:
    "1px solid rgba(0,200,120,.22)",

  color: "#65e0ac",

  lineHeight: 1.8,

  fontSize: 11,
};

const errorBox:
  React.CSSProperties = {
  padding: 12,

  marginTop: 15,

  background:
    "rgba(255,40,40,.08)",

  border:
    "1px solid rgba(255,70,70,.28)",

  color: "#ff9b9b",

  lineHeight: 1.8,

  fontSize: 11,
};