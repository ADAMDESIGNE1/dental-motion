"use client";

import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type PaymentMethod = "kcard" | "zaincash";
type Plan = "basic" | "premium";

type PlanDetails = {
  id: Plan;
  label: string;
  title: string;
  price: string;
  description: string;
  features: string[];
};

const RECEIPT_BUCKET = "payment-receipts";

const PAYMENT_NUMBERS: Record<PaymentMethod, string> = {
  kcard: "7159038244",
  zaincash: "07803447144",
};

const plans: Record<Plan, PlanDetails> = {
  basic: {
    id: "basic",
    label: "BASIC",
    title: "الباقة العادية",
    price: "25,000",
    description:
      "باقة بسيطة ومناسبة للطبيب الذي يريد بداية احترافية وحضور واضح داخل ADAM DESIGN.",
    features: [
      "صفحة خاصة باسم الطبيب",
      "الصورة الشخصية",
      "الاختصاص والخبرة",
      "معلومات التواصل",
      "نبذة مهنية عن الطبيب",
      "حالات Before / After",
    ],
  },

  premium: {
    id: "premium",
    label: "PREMIUM",
    title: "الباقة المميزة",
    price: "50,000",
    description:
      "باقة متكاملة للطبيب الذي يريد مساحة أكبر لعرض أعماله وخبرته وحالاته بشكل احترافي.",
    features: [
      "كل مميزات الباقة العادية",
      "حتى 10 حالات Before / After",
      "عرض الشهادات والمؤهلات",
      "عرض الخدمات والتخصصات",
      "واجهة احترافية للطبيب",
      "مساحة أكبر للأعمال",
      "ملف طبي أكثر تفصيلاً",
      "ظهور احترافي أقوى أمام المرضى",
    ],
  },
};

export default function SubscriptionPage() {
  const [plan, setPlan] = useState<Plan | null>(null);

  const [doctorName, setDoctorName] = useState("");

  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("kcard");

  const [transferNumber, setTransferNumber] = useState("");

  const [receiptFile, setReceiptFile] =
    useState<File | null>(null);

  const [receiptPreview, setReceiptPreview] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =====================================================
     LOAD PAGE
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function initializePage() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(
          window.location.search
        );

        const selectedPlan = params.get("plan");

        if (
          selectedPlan === "basic" ||
          selectedPlan === "premium"
        ) {
          if (mounted) {
            setPlan(selectedPlan);
          }
        } else {
          if (mounted) {
            setError(
              "لم يتم اختيار باقة صحيحة."
            );
          }
        }
      } catch (err) {
        console.error(
          "SUBSCRIPTION INITIALIZE ERROR:",
          err
        );

        if (mounted) {
          setError(
            "حدث خطأ أثناء تحميل صفحة الاشتراك."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializePage();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     RECEIPT
  ===================================================== */

  function chooseReceipt(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError(
        "يرجى اختيار صورة لوصل الدفع."
      );

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

    const previewUrl =
      URL.createObjectURL(file);

    setReceiptFile(file);
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

  /* =====================================================
     UPLOAD RECEIPT
  ===================================================== */

  async function uploadReceipt(
    file: File
  ): Promise<string> {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    /*
     * الطبيب غير مسجل دخول بعد.
     *
     * لذلك نستخدم pending/
     * ولا نعتمد على auth.uid().
     */

    const filePath =
      `pending/${crypto.randomUUID()}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(
        filePath,
        file,
        {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type,
        }
      );

    if (uploadError) {
      throw new Error(
        `فشل رفع صورة الوصل: ${uploadError.message}`
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error(
        "تعذر إنشاء رابط صورة الوصل."
      );
    }

    return publicUrlData.publicUrl;
  }

  /* =====================================================
     SEND TELEGRAM
  ===================================================== */

  async function sendTelegramNotification(
    requestId: string
  ) {
    const {
      data,
      error: functionError,
    } = await supabase.functions.invoke(
      "telegram-subscription",
      {
        body: {
          request_id: requestId,
        },
      }
    );

    if (functionError) {
      console.error(
        "TELEGRAM FUNCTION ERROR:",
        functionError
      );

      /*
       * لا نفشل الطلب إذا فشل Telegram.
       * الطلب يبقى محفوظاً في Supabase.
       */

      return {
        success: false,
        error: functionError.message,
      };
    }

    if (data?.error) {
      console.error(
        "TELEGRAM FUNCTION RESPONSE ERROR:",
        data.error
      );

      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
    };
  }

  /* =====================================================
     SUBMIT REQUEST
  ===================================================== */

  async function submitRequest(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    /* ============================================
       PLAN
    ============================================ */

    if (
      plan !== "basic" &&
      plan !== "premium"
    ) {
      setError(
        "لم يتم اختيار باقة صحيحة."
      );

      return;
    }

    /* ============================================
       DOCTOR NAME
    ============================================ */

    const cleanDoctorName =
      doctorName.trim();

    if (!cleanDoctorName) {
      setError(
        "يرجى كتابة اسم الطبيب."
      );

      return;
    }

    /* ============================================
       WHATSAPP
    ============================================ */

    const cleanWhatsapp =
      whatsappNumber.trim();

    if (!cleanWhatsapp) {
      setError(
        "يرجى كتابة رقم WhatsApp."
      );

      return;
    }

    /* ============================================
       TRANSFER NUMBER
    ============================================ */

    const cleanTransferNumber =
      transferNumber.trim();

    if (!cleanTransferNumber) {
      setError(
        "يرجى كتابة رقم الوصل."
      );

      return;
    }

    /* ============================================
       RECEIPT
    ============================================ */

    if (!receiptFile) {
      setError(
        "يجب رفع صورة وصل الدفع."
      );

      return;
    }

    setSubmitting(true);

    try {
      /* ==========================================
         1. UPLOAD RECEIPT
      ========================================== */

      setMessage(
        "جاري رفع صورة الوصل..."
      );

      const receiptUrl =
        await uploadReceipt(
          receiptFile
        );

      /* ==========================================
         2. CREATE REQUEST ID
         
         مهم:
         ننشئ ID محلياً حتى لا نحتاج
         إلى SELECT بعد INSERT.
      ========================================== */

      const requestId =
        crypto.randomUUID();

      /* ==========================================
         3. CREATE SUBSCRIPTION REQUEST
         
         الطبيب لم ينشئ حساباً بعد،
         لذلك doctor_id = null.
      ========================================== */

      setMessage(
        "جاري إرسال طلب الاشتراك..."
      );

      const {
        error: insertError,
      } = await supabase
        .from("subscription_requests")
        .insert({
          id: requestId,

          doctor_id: null,

          doctor_name:
            cleanDoctorName,

          whatsapp_number:
            cleanWhatsapp,

          plan: plan,

          duration_days: 30,

          payment_method:
            paymentMethod,

          transfer_number:
            cleanTransferNumber,

          receipt_url:
            receiptUrl,

          status: "pending",
        });

      if (insertError) {
        throw new Error(
          `فشل إنشاء طلب الاشتراك: ${insertError.message}`
        );
      }

      /* ==========================================
         4. SEND TELEGRAM
      ========================================== */

      setMessage(
        "تم استلام الطلب. جاري إرسال إشعار للإدارة..."
      );

      const telegramResult =
        await sendTelegramNotification(
          requestId
        );

      /* ==========================================
         5. SUCCESS
      ========================================== */

      setError("");

      if (telegramResult.success) {
        setMessage(
          `تم إرسال طلبك بنجاح.

رقم الطلب:
${requestId}

تم إرسال إشعار إلى الإدارة لمراجعة الدفع.

بعد موافقة الإدارة سيتم التواصل معك عبر WhatsApp وإرسال رابط إكمال التسجيل.`
        );
      } else {
        setMessage(
          `تم حفظ طلبك بنجاح.

رقم الطلب:
${requestId}

لكن تعذر إرسال إشعار Telegram للإدارة حالياً. الطلب محفوظ ويمكن مراجعته من لوحة الإدارة.`
        );
      }

      setTransferNumber("");
      setWhatsappNumber("");
      setDoctorName("");

      removeReceipt();
    } catch (err) {
      console.error(
        "SUBSCRIPTION ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء إرسال طلب الاشتراك."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main
        dir="rtl"
        style={loadingStyle}
      >
        جاري تحميل صفحة الاشتراك...
      </main>
    );
  }

  /* =====================================================
     INVALID PLAN
  ===================================================== */

  if (!plan) {
    return (
      <main
        dir="rtl"
        style={pageStyle}
      >
        <div style={containerStyle}>
          <div style={errorBox}>
            اختر الباقة من الصفحة الرئيسية أولاً.
          </div>

          <button
            type="button"
            style={submitButton}
            onClick={() =>
              (window.location.href = "/")
            }
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </main>
    );
  }

  const selectedPlan =
    plans[plan];

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main
      dir="rtl"
      style={pageStyle}
    >
      <div style={containerStyle}>

        {/* HEADER */}

        <header style={header}>
          <div>
            <div style={brand}>
              ADAM DESIGN
            </div>

            <h1 style={title}>
              إكمال الاشتراك
            </h1>

            <p style={subtitle}>
              اختر الباقة، أدخل معلوماتك وارفع
              وصل الدفع. لا تحتاج إلى إنشاء حساب
              الآن. بعد مراجعة الطلب والموافقة
              عليه سيتم إرسال رابط إكمال التسجيل
              إلى رقم WhatsApp الذي أدخلته.
            </p>
          </div>

          <button
            type="button"
            style={backButton}
            onClick={() =>
              window.history.back()
            }
          >
            رجوع
          </button>
        </header>

        {/* MESSAGE */}

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

        {/* SELECTED PLAN */}

        <section style={section}>
          <div style={sectionLabel}>
            SELECTED PLAN
          </div>

          <h2 style={sectionTitle}>
            {selectedPlan.title}
          </h2>

          <div style={selectedPlanTop}>
            <div>
              <div style={selectedPlanLabel}>
                {selectedPlan.label}
              </div>

              <p style={muted}>
                {selectedPlan.description}
              </p>
            </div>

            <div style={selectedPrice}>
              <strong
                style={{
                  fontFamily:
                    "Georgia, serif",
                  fontSize: 38,
                }}
              >
                {selectedPlan.price}
              </strong>

              <span
                style={{
                  color: "#32baff",
                }}
              >
                د.ع
              </span>
            </div>
          </div>

          <div style={detailsTitle}>
            ماذا تحصل عليه؟
          </div>

          <div style={detailsGrid}>
            {selectedPlan.features.map(
              (feature, index) => (
                <div
                  key={index}
                  style={detailItem}
                >
                  <span style={check}>
                    ✓
                  </span>

                  <span>
                    {feature}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* PAYMENT */}

        <section style={section}>
          <div style={sectionLabel}>
            PAYMENT
          </div>

          <h2 style={sectionTitle}>
            طريقة الدفع
          </h2>

          <p style={muted}>
            اختر طريقة الدفع التي استخدمتها
            لإرسال مبلغ الاشتراك.
          </p>

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
                setPaymentMethod(
                  "zaincash"
                )
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
              حول مبلغ الاشتراك الخاص بالباقة
              إلى وسيلة الدفع المعتمدة، وبعدها
              أدخل رقم العملية وارفع صورة واضحة
              لوصل الدفع.
            </p>

            <div style={paymentNumber}>
              رقم الدفع:{" "}
              <strong>
                {PAYMENT_NUMBERS[paymentMethod]}
              </strong>
            </div>
          </div>

          {/* DOCTOR NAME */}

          <label style={label}>
            اسم الطبيب
          </label>

          <input
            type="text"
            value={doctorName}
            onChange={(e) =>
              setDoctorName(
                e.target.value
              )
            }
            placeholder="مثال: د. محمد أحمد"
            style={input}
            autoComplete="name"
          />

          {/* WHATSAPP */}

          <label style={label}>
            رقم WhatsApp
          </label>

          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) =>
              setWhatsappNumber(
                e.target.value
              )
            }
            placeholder="مثال: 077xxxxxxxx"
            style={input}
            inputMode="tel"
            autoComplete="tel"
          />

          <div style={whatsappHint}>
            هذا الرقم سيتم استخدامه للتواصل معك
            وإرسال رابط إكمال التسجيل بعد موافقة
            الإدارة على طلب الاشتراك.
          </div>

          {/* TRANSFER NUMBER */}

          <label style={label}>
            رقم الوصل / رقم العملية
          </label>

          <input
            type="text"
            value={transferNumber}
            onChange={(e) =>
              setTransferNumber(
                e.target.value
              )
            }
            placeholder="اكتب رقم العملية أو رقم الوصل"
            style={input}
            inputMode="numeric"
            autoComplete="off"
          />
        </section>

        {/* RECEIPT */}

        <section style={section}>
          <div style={sectionLabel}>
            PAYMENT RECEIPT
          </div>

          <h2 style={sectionTitle}>
            رفع وصل الدفع
          </h2>

          <p style={muted}>
            اختر صورة واضحة لوصل الدفع.
            الحد الأعلى لحجم الصورة هو 10MB.
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
              لم يتم اختيار صورة وصل بعد
            </div>
          )}
        </section>

        {/* SUBMIT */}

        <section style={section}>
          <div style={finalBox}>
            <div>
              <div style={finalTitle}>
                جاهز لإرسال طلبك؟
              </div>

              <p style={finalText}>
                بعد الضغط على إرسال سيتم إنشاء
                طلب اشتراك برقم خاص، وإرسال
                إشعار للإدارة لمراجعة معلومات
                الدفع. لا تحتاج إلى تسجيل الدخول
                في هذه المرحلة.
              </p>
            </div>

            <button
              type="submit"
              form="subscription-form"
              disabled={submitting}
              style={{
                ...submitButton,
                opacity: submitting
                  ? 0.6
                  : 1,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {submitting
                ? "جاري إرسال الطلب..."
                : "إرسال طلب الاشتراك"}
            </button>
          </div>
        </section>

        {/* ACTUAL FORM */}

        <form
          id="subscription-form"
          onSubmit={submitRequest}
        >
          <button
            type="submit"
            hidden
            aria-hidden="true"
          >
            submit
          </button>
        </form>

      </div>
    </main>
  );
}

/* =========================================================
   STYLES
========================================================= */

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 0%, rgba(0,140,255,.15), transparent 35%), #020409",
  color: "#fff",
  padding: "30px 16px 80px",
  fontFamily: "Arial, sans-serif",
};

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#020409",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial, sans-serif",
};

const containerStyle: CSSProperties = {
  maxWidth: 1050,
  margin: "auto",
};

const header: CSSProperties = {
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

const brand: CSSProperties = {
  color: "#c7a85d",
  fontSize: 12,
  letterSpacing: ".22em",
  fontWeight: 700,
};

const title: CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: 40,
  margin: "10px 0",
};

const subtitle: CSSProperties = {
  color: "rgba(255,255,255,.5)",
  maxWidth: 650,
  lineHeight: 1.9,
  fontSize: 13,
};

const backButton: CSSProperties = {
  padding: "11px 20px",
  background:
    "rgba(0,140,255,.08)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.3)",
  cursor: "pointer",
};

const section: CSSProperties = {
  background:
    "rgba(3,8,18,.88)",
  border:
    "1px solid rgba(0,140,255,.16)",
  padding: 30,
  marginBottom: 22,
};

const sectionLabel: CSSProperties = {
  color: "#c7a85d",
  fontSize: 9,
  letterSpacing: ".2em",
};

const sectionTitle: CSSProperties = {
  fontFamily: "Georgia, serif",
  fontWeight: 400,
  fontSize: 27,
  margin: "8px 0",
};

const muted: CSSProperties = {
  color: "rgba(255,255,255,.45)",
  fontSize: 12,
  lineHeight: 1.8,
};

const selectedPlanTop: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 25,
  flexWrap: "wrap",
  marginTop: 15,
};

const selectedPlanLabel: CSSProperties = {
  color: "#32baff",
  fontSize: 10,
  letterSpacing: ".18em",
};

const selectedPrice: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 7,
};

const detailsTitle: CSSProperties = {
  marginTop: 25,
  marginBottom: 15,
  color: "#c7a85d",
  fontSize: 13,
};

const detailsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(240px,1fr))",
  gap: 10,
};

const detailItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 12,
  background:
    "rgba(0,140,255,.05)",
  border:
    "1px solid rgba(255,255,255,.06)",
  color: "rgba(255,255,255,.7)",
  fontSize: 11,
};

const check: CSSProperties = {
  color: "#32baff",
  fontSize: 15,
};

const paymentGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  marginTop: 22,
};

const paymentCard: CSSProperties = {
  padding: 22,
  background:
    "rgba(0,0,0,.22)",
  color: "#fff",
  border:
    "1px solid rgba(255,255,255,.1)",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  textAlign: "right",
};

const selectedPayment: CSSProperties = {
  border:
    "1px solid rgba(0,140,255,.8)",
  background:
    "rgba(0,140,255,.12)",
};

const paymentInfo: CSSProperties = {
  marginTop: 22,
  padding: 20,
  background:
    "rgba(0,140,255,.06)",
  border:
    "1px solid rgba(0,140,255,.14)",
};

const infoTitle: CSSProperties = {
  color: "#c7a85d",
  fontSize: 13,
  marginBottom: 8,
};

const infoText: CSSProperties = {
  color:
    "rgba(255,255,255,.55)",
  fontSize: 12,
  lineHeight: 1.9,
};

const paymentNumber: CSSProperties = {
  marginTop: 12,
  padding: 12,
  background:
    "rgba(0,0,0,.3)",
  color: "#32baff",
  fontSize: 12,
};

const label: CSSProperties = {
  display: "block",
  color: "#c7a85d",
  fontSize: 10,
  margin: "22px 0 8px",
};

const input: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 15,
  background:
    "rgba(0,0,0,.35)",
  color: "#fff",
  border:
    "1px solid rgba(0,140,255,.2)",
  outline: "none",
  fontSize: 13,
};

const whatsappHint: CSSProperties = {
  marginTop: 8,
  color:
    "rgba(255,255,255,.35)",
  fontSize: 10,
  lineHeight: 1.7,
};

const fileButton: CSSProperties = {
  display: "inline-block",
  marginTop: 15,
  padding: "13px 22px",
  background:
    "rgba(0,140,255,.1)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.35)",
  cursor: "pointer",
  fontSize: 11,
};

const receiptBox: CSSProperties = {
  marginTop: 22,
  maxWidth: 500,
  background:
    "rgba(0,0,0,.3)",
  border:
    "1px solid rgba(255,255,255,.08)",
  padding: 12,
};

const receiptImage: CSSProperties = {
  width: "100%",
  maxHeight: 600,
  objectFit: "contain",
  display: "block",
  background: "#080c14",
};

const removeButton: CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  background: "transparent",
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,70,70,.25)",
  cursor: "pointer",
};

const emptyReceipt: CSSProperties = {
  marginTop: 20,
  padding: 35,
  textAlign: "center",
  border:
    "1px dashed rgba(255,255,255,.12)",
  color:
    "rgba(255,255,255,.3)",
};

const finalBox: CSSProperties = {
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

const finalTitle: CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 22,
};

const finalText: CSSProperties = {
  color:
    "rgba(255,255,255,.45)",
  fontSize: 11,
  lineHeight: 1.8,
  maxWidth: 600,
};

const submitButton: CSSProperties = {
  padding: "15px 28px",
  background: "#008cff",
  color: "#fff",
  border: 0,
  cursor: "pointer",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const successBox: CSSProperties = {
  padding: 14,
  marginBottom: 20,
  background:
    "rgba(0,180,255,.08)",
  border:
    "1px solid rgba(0,180,255,.25)",
  color: "#7dccff",
  whiteSpace: "pre-line",
};

const errorBox: CSSProperties = {
  padding: 14,
  marginBottom: 20,
  background:
    "rgba(255,40,40,.08)",
  border:
    "1px solid rgba(255,70,70,.3)",
  color: "#ff9b9b",
};