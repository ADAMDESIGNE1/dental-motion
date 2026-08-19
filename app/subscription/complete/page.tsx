"use client";

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PaymentMethod = "kcard" | "zaincash";

const RECEIPT_BUCKET = "payment-receipts";

const PLAN_DURATION_DAYS: Record<string, number> = {
  basic: 30,
  professional: 30,
  premium: 30,
};

function SubscriptionCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("kcard");

  const [transferNumber, setTransferNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      await loadUser();

      const selectedPlan = searchParams.get("plan");

      if (
        selectedPlan &&
        PLAN_DURATION_DAYS[selectedPlan]
      ) {
        setPlan(selectedPlan);
      }
    }

    init();
  }, [searchParams]);

  async function loadUser() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(authError);
      setError("حدث خطأ أثناء التحقق من تسجيل الدخول.");
      setLoading(false);
      return;
    }

    if (!user) {
      router.replace("/doctor-login");
      return;
    }

    setUserId(user.id);
    setLoading(false);
  }

  function chooseReceipt(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("يجب اختيار صورة للوصل.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "حجم صورة الوصل يجب أن يكون أقل من 10MB."
      );
      e.target.value = "";
      return;
    }

    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }

    setReceiptFile(file);

    const previewUrl = URL.createObjectURL(file);
    setReceiptPreview(previewUrl);

    e.target.value = "";
  }

  function removeReceipt() {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }

    setReceiptFile(null);
    setReceiptPreview(null);
  }

  async function uploadReceipt(file: File) {
    if (!userId) {
      throw new Error("المستخدم غير مسجل الدخول.");
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path =
      `${userId}/subscription/` +
      `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } =
      await supabase.storage
        .from(RECEIPT_BUCKET)
        .upload(path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type,
        });

    if (uploadError) {
      throw new Error(
        `فشل رفع الوصل: ${uploadError.message}`
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(path);

    return publicUrl;
  }

  async function submitRequest(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!userId) {
      setError("يجب تسجيل الدخول أولاً.");
      return;
    }

    if (!plan.trim()) {
      setError("اختر الباقة أولاً.");
      return;
    }

    const durationDays =
      PLAN_DURATION_DAYS[plan.trim()];

    if (!durationDays) {
      setError("الباقة المختارة غير صحيحة.");
      return;
    }

    if (!transferNumber.trim()) {
      setError("اكتب رقم التحويل.");
      return;
    }

    if (!receiptFile) {
      setError("يجب رفع صورة وصل الدفع.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. التحقق من وجود الطبيب
      const {
        data: doctor,
        error: doctorError,
      } = await supabase
        .from("doctors")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (doctorError) {
        throw new Error(
          `تعذر التحقق من حساب الطبيب: ${doctorError.message}`
        );
      }

      if (!doctor) {
        throw new Error(
          "حساب الطبيب غير موجود في جدول doctors. يجب إنشاء حساب الطبيب أولاً."
        );
      }

      // 2. منع إرسال طلبين pending
      const {
        data: pendingRequests,
        error: pendingError,
      } = await supabase
        .from("subscription_requests")
        .select("id")
        .eq("doctor_id", doctor.id)
        .eq("status", "pending")
        .limit(1);

      if (pendingError) {
        throw new Error(
          `تعذر التحقق من الطلبات السابقة: ${pendingError.message}`
        );
      }

      if (
        pendingRequests &&
        pendingRequests.length > 0
      ) {
        throw new Error(
          "لديك طلب اشتراك قيد المراجعة حالياً."
        );
      }

      // 3. رفع الوصل
      setMessage("جاري رفع وصل الدفع...");

      const receiptUrl =
        await uploadReceipt(receiptFile);

      // 4. إنشاء الطلب
      setMessage("جاري إرسال طلب الاشتراك...");

      const {
        data: insertedRequest,
        error: insertError,
      } = await supabase
        .from("subscription_requests")
        .insert({
          doctor_id: doctor.id,
          plan: plan.trim(),
          payment_method: paymentMethod,
          transfer_number: transferNumber.trim(),
          receipt_url: receiptUrl,
          duration_days: durationDays,
          status: "pending",
        })
        .select(
          "id, doctor_id, plan, duration_days, status"
        )
        .single();

      if (insertError) {
        throw new Error(
          `فشل إنشاء طلب الاشتراك: ${insertError.message}`
        );
      }

      // 5. التأكد من الربط
      if (
        !insertedRequest ||
        insertedRequest.doctor_id !== doctor.id
      ) {
        throw new Error(
          "تم إنشاء الطلب لكن لم يتم ربطه بحساب الطبيب بشكل صحيح."
        );
      }

      console.log(
        "Subscription request created:",
        insertedRequest
      );

      setMessage(
        "تم إرسال طلب الاشتراك بنجاح. سيتم مراجعته من الإدارة."
      );

      setTransferNumber("");
      removeReceipt();

      setTimeout(() => {
        router.push("/doctor-dashboard");
      }, 1800);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء إرسال طلب الاشتراك."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={loadingStyle} dir="rtl">
        جاري تحميل صفحة الاشتراك...
      </main>
    );
  }

  return (
    <main dir="rtl" style={pageStyle}>
      <div style={containerStyle}>
        <header style={header}>
          <div>
            <div style={brand}>
              ADAM DESIGN
            </div>

            <h1 style={title}>
              إكمال الاشتراك
            </h1>

            <p style={subtitle}>
              خلّي حضورك المهني أقوى وخلي المرضى
              يشوفون شغلك بشكل احترافي.
            </p>
          </div>

          <button
            type="button"
            style={backButton}
            onClick={() => router.back()}
          >
            رجوع
          </button>
        </header>

        {message && (
          <div style={successBox}>
            {message}
          </div>
        )}

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={submitRequest}>
          <section style={section}>
            <div style={sectionLabel}>
              SUBSCRIPTION PLAN
            </div>

            <h2 style={sectionTitle}>
              الباقة المختارة
            </h2>

            <p style={muted}>
              اختر الباقة التي تريد الاشتراك بها.
            </p>

            <div style={plansGrid}>
              <button
                type="button"
                onClick={() => setPlan("basic")}
                style={{
                  ...planCard,
                  ...(plan === "basic"
                    ? selectedPlan
                    : {}),
                }}
              >
                <div style={planName}>
                  BASIC
                </div>

                <div style={planArabic}>
                  الباقة الأساسية
                </div>

                <div style={planDescription}>
                  بداية احترافية لظهور الطبيب
                  على ADAM DESIGN.
                </div>

                <div style={durationText}>
                  مدة الاشتراك: 30 يوم
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPlan("professional")
                }
                style={{
                  ...planCard,
                  ...(plan === "professional"
                    ? selectedPlan
                    : {}),
                }}
              >
                <div style={planName}>
                  PROFESSIONAL
                </div>

                <div style={planArabic}>
                  الباقة الاحترافية
                </div>

                <div style={planDescription}>
                  حضور أقوى ومظهر أكثر احترافية
                  للطبيب وعيادته.
                </div>

                <div style={durationText}>
                  مدة الاشتراك: 30 يوم
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPlan("premium")}
                style={{
                  ...planCard,
                  ...(plan === "premium"
                    ? selectedPlan
                    : {}),
                }}
              >
                <div style={planName}>
                  PREMIUM
                </div>

                <div style={planArabic}>
                  الباقة المميزة
                </div>

                <div style={planDescription}>
                  تجربة متكاملة للطبيب الذي
                  يريد إبراز أعماله بشكل مميز.
                </div>

                <div style={durationText}>
                  مدة الاشتراك: 30 يوم
                </div>
              </button>
            </div>
          </section>

          <section style={section}>
            <div style={sectionLabel}>
              PAYMENT
            </div>

            <h2 style={sectionTitle}>
              طريقة الدفع
            </h2>

            <div style={paymentGrid}>
              <button
                type="button"
                onClick={() =>
                  setPaymentMethod("kcard")
                }
                style={{
                  ...paymentCard,
                  ...(paymentMethod === "kcard"
                    ? selectedPayment
                    : {}),
                }}
              >
                <strong>
                  كي كارد
                </strong>

                <span>
                  K-Card
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod("zaincash")
                }
                style={{
                  ...paymentCard,
                  ...(paymentMethod === "zaincash"
                    ? selectedPayment
                    : {}),
                }}
              >
                <strong>
                  زين كاش
                </strong>

                <span>
                  Zain Cash
                </span>
              </button>
            </div>

            <div style={paymentInfo}>
              <div style={infoTitle}>
                معلومات التحويل
              </div>

              <p style={infoText}>
                حوّل قيمة الاشتراك إلى وسيلة الدفع
                المعتمدة، وبعدها ارفع صورة الوصل
                حتى تتمكن الإدارة من مراجعة طلبك.
              </p>

              <div style={paymentNumber}>
                رقم الدفع: سيتم عرضه هنا
              </div>
            </div>

            <label style={label}>
              رقم التحويل
            </label>

            <input
              type="text"
              value={transferNumber}
              onChange={(e) =>
                setTransferNumber(e.target.value)
              }
              placeholder="اكتب رقم العملية أو رقم التحويل"
              style={input}
              inputMode="numeric"
            />
          </section>

          <section style={section}>
            <div style={sectionLabel}>
              PAYMENT RECEIPT
            </div>

            <h2 style={sectionTitle}>
              رفع وصل الدفع
            </h2>

            <p style={muted}>
              صوّر الوصل أو اختاره مباشرة من
              الاستوديو في الهاتف أو الكمبيوتر.
            </p>

            <label style={fileButton}>
              اختيار صورة الوصل

              <input
                type="file"
                accept="image/*"
                onChange={chooseReceipt}
                hidden
              />
            </label>

            {receiptPreview ? (
              <div style={receiptBox}>
                <img
                  src={receiptPreview}
                  alt="وصل الدفع"
                  style={receiptImage}
                />

                <button
                  type="button"
                  onClick={removeReceipt}
                  style={removeButton}
                >
                  حذف الوصل واختيار صورة أخرى
                </button>
              </div>
            ) : (
              <div style={emptyReceipt}>
                لم يتم اختيار وصل بعد
              </div>
            )}
          </section>

          <section style={section}>
            <div style={finalBox}>
              <div>
                <div style={finalTitle}>
                  جاهز لتطوير حضورك؟
                </div>

                <p style={finalText}>
                  أرسل طلب الاشتراك وسيتم مراجعته
                  من الإدارة. بعد الموافقة سيتم
                  تفعيل اشتراك الطبيب.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...submitButton,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting
                  ? "جاري إرسال الطلب..."
                  : "إرسال طلب الاشتراك"}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

export default function SubscriptionCompletePage() {
  return (
    <Suspense
      fallback={
        <main style={loadingStyle} dir="rtl">
          جاري تحميل صفحة الاشتراك...
        </main>
      }
    >
      <SubscriptionCompleteContent />
    </Suspense>
  );
}

/* ============================================
   STYLES
============================================ */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 0%, rgba(0,140,255,.15), transparent 35%), #020409",
  color: "#fff",
  padding: "30px 16px 80px",
  fontFamily: "Arial, sans-serif",
};

const loadingStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#020409",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1050,
  margin: "auto",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  paddingBottom: 30,
  marginBottom: 25,
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const brand: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 12,
  letterSpacing: ".22em",
  fontWeight: 700,
};

const title: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: 40,
  margin: "10px 0",
};

const subtitle: React.CSSProperties = {
  color: "rgba(255,255,255,.5)",
  maxWidth: 600,
  lineHeight: 1.9,
  fontSize: 13,
};

const backButton: React.CSSProperties = {
  padding: "11px 20px",
  background: "rgba(0,140,255,.08)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.3)",
  cursor: "pointer",
};

const section: React.CSSProperties = {
  background: "rgba(3,8,18,.88)",
  border:
    "1px solid rgba(0,140,255,.16)",
  padding: 30,
  marginBottom: 22,
};

const sectionLabel: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 9,
  letterSpacing: ".2em",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: 27,
  margin: "8px 0",
};

const muted: React.CSSProperties = {
  color: "rgba(255,255,255,.45)",
  fontSize: 12,
  lineHeight: 1.8,
};

const plansGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  marginTop: 22,
};

const planCard: React.CSSProperties = {
  textAlign: "right",
  padding: 22,
  background: "rgba(0,0,0,.22)",
  color: "#fff",
  border:
    "1px solid rgba(255,255,255,.1)",
  cursor: "pointer",
  minHeight: 175,
};

const selectedPlan: React.CSSProperties = {
  border:
    "1px solid rgba(0,140,255,.8)",
  background:
    "linear-gradient(145deg,rgba(0,140,255,.16),rgba(0,0,0,.3))",
  boxShadow:
    "0 0 30px rgba(0,140,255,.08)",
};

const planName: React.CSSProperties = {
  color: "#32baff",
  fontSize: 11,
  letterSpacing: ".18em",
};

const planArabic: React.CSSProperties = {
  fontSize: 18,
  marginTop: 10,
};

const planDescription: React.CSSProperties = {
  color: "rgba(255,255,255,.45)",
  fontSize: 11,
  lineHeight: 1.8,
  marginTop: 10,
};

const durationText: React.CSSProperties = {
  marginTop: 12,
  color: "#c7a85d",
  fontSize: 11,
};

const paymentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  marginTop: 22,
};

const paymentCard: React.CSSProperties = {
  padding: 22,
  background: "rgba(0,0,0,.22)",
  color: "#fff",
  border:
    "1px solid rgba(255,255,255,.1)",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  textAlign: "right",
};

const selectedPayment: React.CSSProperties = {
  border:
    "1px solid rgba(0,140,255,.8)",
  background:
    "rgba(0,140,255,.12)",
};

const paymentInfo: React.CSSProperties = {
  marginTop: 22,
  padding: 20,
  background: "rgba(0,140,255,.06)",
  border:
    "1px solid rgba(0,140,255,.14)",
};

const infoTitle: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 13,
  marginBottom: 8,
};

const infoText: React.CSSProperties = {
  color: "rgba(255,255,255,.55)",
  fontSize: 12,
  lineHeight: 1.9,
};

const paymentNumber: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  background: "rgba(0,0,0,.3)",
  color: "#32baff",
  fontSize: 12,
};

const label: React.CSSProperties = {
  display: "block",
  color: "#c7a85d",
  fontSize: 10,
  margin: "22px 0 8px",
};

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 15,
  background: "rgba(0,0,0,.35)",
  color: "#fff",
  border:
    "1px solid rgba(0,140,255,.2)",
  outline: "none",
  fontSize: 13,
};

const fileButton: React.CSSProperties = {
  display: "inline-block",
  marginTop: 15,
  padding: "13px 22px",
  background: "rgba(0,140,255,.1)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.35)",
  cursor: "pointer",
  fontSize: 11,
};

const receiptBox: React.CSSProperties = {
  marginTop: 22,
  maxWidth: 500,
  background: "rgba(0,0,0,.3)",
  border:
    "1px solid rgba(255,255,255,.08)",
  padding: 12,
};

const receiptImage: React.CSSProperties = {
  width: "100%",
  maxHeight: 600,
  objectFit: "contain",
  display: "block",
  background: "#080c14",
};

const removeButton: React.CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  background: "transparent",
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,70,70,.25)",
  cursor: "pointer",
};

const emptyReceipt: React.CSSProperties = {
  marginTop: 20,
  padding: 35,
  textAlign: "center",
  border:
    "1px dashed rgba(255,255,255,.12)",
  color: "rgba(255,255,255,.3)",
};

const finalBox: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  padding: 22,
  background:
    "linear-gradient(135deg,rgba(0,140,255,.1),rgba(199,168,93,.04))",
  border:
    "1px solid rgba(0,140,255,.18)",
};

const finalTitle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 22,
};

const finalText: React.CSSProperties = {
  color: "rgba(255,255,255,.45)",
  fontSize: 11,
  lineHeight: 1.8,
  maxWidth: 600,
};

const submitButton: React.CSSProperties = {
  padding: "15px 28px",
  background: "#008cff",
  color: "#fff",
  border: 0,
  cursor: "pointer",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const successBox: React.CSSProperties = {
  padding: 14,
  marginBottom: 20,
  background: "rgba(0,180,255,.08)",
  border:
    "1px solid rgba(0,180,255,.25)",
  color: "#7dccff",
};

const errorBox: React.CSSProperties = {
  padding: 14,
  marginBottom: 20,
  background: "rgba(255,40,40,.08)",
  border:
    "1px solid rgba(255,70,70,.3)",
  color: "#ff9b9b",
};