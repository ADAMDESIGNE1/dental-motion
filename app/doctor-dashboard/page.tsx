"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Doctor = {
  id: string;
  slug: string | null;
  full_name: string;
  specialty: string;
  sub_specialty: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  years_experience: number | null;
  profile_image: string | null;
  certificates: string[] | null;
  services: string[] | null;
  subscription_active: boolean;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  is_approved: boolean;
  subscription_plan: string | null;
  subscription_duration_days: number | null;
};

type DoctorCase = {
  id: string;
  doctor_id: string;
  title: string;
  description: string | null;
  before_image: string;
  after_image: string;
  is_published: boolean;
};

const PROFILE_BUCKET = "doctor-images";
const CERTIFICATE_BUCKET = "doctor-certificates";
const CASE_BUCKET = "doctor-cases";

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [cases, setCases] = useState<DoctorCase[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caseSaving, setCaseSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalPlan, setRenewalPlan] =
    useState<"basic" | "premium">("basic");
  const [renewalDuration, setRenewalDuration] = useState("30");
  const [renewalPaymentMethod, setRenewalPaymentMethod] =
    useState<"zaincash" | "kcard">("zaincash");
  const [renewalTransferNumber, setRenewalTransferNumber] = useState("");
  const [renewalWhatsapp, setRenewalWhatsapp] = useState("");
  const [renewalReceipt, setRenewalReceipt] = useState<File | null>(null);
  const [renewalSending, setRenewalSending] = useState(false);
  const [renewalPending, setRenewalPending] = useState(false);

  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [subSpecialty, setSubSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<string[]>([]);

  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingBefore, setEditingBefore] = useState<string | null>(null);
  const [editingAfter, setEditingAfter] = useState<string | null>(null);

  useEffect(() => {
    loadDoctor();
  }, []);

  async function loadDoctor() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/doctor-login");
      return;
    }

    const { data, error: doctorError } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (doctorError || !data) {
      console.error(doctorError);
      setError("تعذر تحميل معلومات الطبيب.");
      setLoading(false);
      return;
    }

    setDoctor(data);

    setFullName(data.full_name || "");
    setSpecialty(data.specialty || "");
    setSubSpecialty(data.sub_specialty || "");
    setBio(data.bio || "");
    setPhone(data.phone || "");
    setClinicName(data.clinic_name || "");
    setClinicAddress(data.clinic_address || "");
    setYearsExperience(
      data.years_experience?.toString() || ""
    );
    setProfileImage(data.profile_image || null);
    setCertificates(data.certificates || []);
    setRenewalWhatsapp(
      data.whatsapp_number ||
      data.phone ||
      ""
    );

    const { data: pendingRenewals } =
      await supabase
        .from("subscription_requests")
        .select("id")
        .eq("doctor_id", user.id)
        .eq("status", "pending")
        .limit(1);

    setRenewalPending(
      Boolean(pendingRenewals?.length)
    );

    const { data: caseData, error: caseError } =
      await supabase
        .from("doctor_cases")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

    if (caseError) {
      console.error(caseError);
      setError(
        "تعذر تحميل الحالات: " + caseError.message
      );
    } else {
      setCases(caseData || []);
    }

    setLoading(false);
  }

  async function uploadImage(
    file: File,
    bucket: string,
    folder: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("يجب تسجيل الدخول.");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("الملف يجب أن يكون صورة.");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("حجم الصورة يجب أن يكون أقل من 10MB.");
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path =
      `${user.id}/${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        cacheControl: "3600",
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return supabase.storage
      .from(bucket)
      .getPublicUrl(path).data.publicUrl;
  }

  async function chooseProfileImage(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const url = await uploadImage(
        file,
        PROFILE_BUCKET,
        "profile"
      );

      setProfileImage(url);

      setMessage(
        "تم اختيار الصورة الشخصية. اضغط حفظ المعلومات."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "فشل رفع الصورة."
      );
    }

    setUploading(false);
    e.target.value = "";
  }

  async function chooseCertificates(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const urls: string[] = [];

      for (const file of files) {
        const url = await uploadImage(
          file,
          CERTIFICATE_BUCKET,
          "certificates"
        );

        urls.push(url);
      }

      setCertificates((old) => [...old, ...urls]);

      setMessage(
        `تم رفع ${urls.length} شهادة. اضغط حفظ المعلومات.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "فشل رفع الشهادة."
      );
    }

    setUploading(false);
    e.target.value = "";
  }

  async function saveDoctor(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!fullName.trim() || !specialty.trim()) {
      setError("اسم الطبيب والاختصاص مطلوبان.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/doctor-login");
      return;
    }

    const { data, error: updateError } =
      await supabase
        .from("doctors")
        .update({
          full_name: fullName.trim(),
          specialty: specialty.trim(),
          sub_specialty:
            subSpecialty.trim() || null,
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          clinic_name:
            clinicName.trim() || null,
          clinic_address:
            clinicAddress.trim() || null,
          years_experience:
            yearsExperience
              ? Number(yearsExperience)
              : null,
          profile_image: profileImage,
          certificates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

    if (updateError) {
      setError(
        "تعذر حفظ المعلومات: " +
          updateError.message
      );
    } else {
      setDoctor(data);
      setMessage("تم حفظ معلومات الطبيب بنجاح.");
    }

    setSaving(false);
  }

  async function chooseCaseImage(
    e: ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const url = await uploadImage(
        file,
        CASE_BUCKET,
        "cases"
      );

      if (type === "before") {
        setBeforeImage(url);
      } else {
        setAfterImage(url);
      }

      setMessage("تم رفع الصورة.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "فشل رفع الصورة."
      );
    }

    setUploading(false);
    e.target.value = "";
  }

  const currentPlan =
    (doctor?.subscription_plan || "basic").toLowerCase();

  const publishedCasesCount =
    cases.filter((item) => item.is_published).length;

  const publishedCasesLimit =
    currentPlan === "premium" ? 10 : 2;

  const canPublishMore =
    publishedCasesCount < publishedCasesLimit;

  const subscriptionExpired =
    Boolean(
      doctor?.subscription_expires_at &&
      new Date(
        doctor.subscription_expires_at
      ).getTime() <= Date.now()
    );

  const subscriptionReallyActive =
    Boolean(
      doctor?.subscription_active &&
      !subscriptionExpired
    );

  async function addCase(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!caseTitle.trim()) {
      setError("اكتب عنوان الحالة.");
      return;
    }

    if (!beforeImage || !afterImage) {
      setError(
        "يجب اختيار صورة قبل وصورة بعد."
      );
      return;
    }

    setCaseSaving(true);
    setError("");
    setMessage("");

    const publishNewCase =
      publishedCasesCount < publishedCasesLimit;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/doctor-login");
      return;
    }

    const { data, error: insertError } =
      await supabase
        .from("doctor_cases")
        .insert({
          doctor_id: user.id,
          title: caseTitle.trim(),
          description:
            caseDescription.trim() || null,
          before_image: beforeImage,
          after_image: afterImage,
          is_published: publishNewCase,
        })
        .select()
        .single();

    if (insertError) {
      setError(
        "تعذر إضافة الحالة: " +
          insertError.message
      );

      setCaseSaving(false);
      return;
    }

    setCases((old) => [data, ...old]);

    setCaseTitle("");
    setCaseDescription("");
    setBeforeImage(null);
    setAfterImage(null);

    setMessage(
      publishNewCase
        ? "تمت إضافة الحالة ونشرها بنجاح."
        : `تمت إضافة الحالة كمخفية لأنك وصلت إلى حد الباقة (${publishedCasesLimit} حالات منشورة).`
    );
    setCaseSaving(false);
  }

  function editCase(item: DoctorCase) {
    setEditingId(item.id);
    setEditingTitle(item.title);
    setEditingDescription(
      item.description || ""
    );
    setEditingBefore(item.before_image);
    setEditingAfter(item.after_image);

    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingBefore(null);
    setEditingAfter(null);
  }

  async function editCaseImage(
    e: ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const url = await uploadImage(
        file,
        CASE_BUCKET,
        "cases"
      );

      if (type === "before") {
        setEditingBefore(url);
      } else {
        setEditingAfter(url);
      }

      setMessage("تم اختيار الصورة الجديدة.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "فشل رفع الصورة."
      );
    }

    setUploading(false);
    e.target.value = "";
  }

  async function saveCaseEdit() {
    if (!editingId) return;

    if (!editingTitle.trim()) {
      setError("عنوان الحالة مطلوب.");
      return;
    }

    if (!editingBefore || !editingAfter) {
      setError(
        "يجب وجود صورة قبل وصورة بعد."
      );
      return;
    }

    setCaseSaving(true);
    setError("");

    const { data, error: updateError } =
      await supabase
        .from("doctor_cases")
        .update({
          title: editingTitle.trim(),
          description:
            editingDescription.trim() || null,
          before_image: editingBefore,
          after_image: editingAfter,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .select()
        .single();

    if (updateError) {
      setError(
        "تعذر تعديل الحالة: " +
          updateError.message
      );

      setCaseSaving(false);
      return;
    }

    setCases((old) =>
      old.map((item) =>
        item.id === editingId ? data : item
      )
    );

    cancelEdit();

    setMessage("تم تعديل الحالة.");
    setCaseSaving(false);
  }

  async function togglePublish(item: DoctorCase) {
    setError("");

    if (
      !item.is_published &&
      publishedCasesCount >= publishedCasesLimit
    ) {
      setError(
        `وصلت إلى الحد الأقصى للباقة ${currentPlan === "premium" ? "المميزة" : "العادية"}: ${publishedCasesLimit} حالات منشورة. أخفِ حالة منشورة أولاً أو قم بترقية الباقة.`
      );
      return;
    }

    const { data, error: updateError } =
      await supabase
        .from("doctor_cases")
        .update({
          is_published: !item.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .select()
        .single();

    if (updateError) {
      setError(
        "تعذر تغيير حالة النشر: " +
          updateError.message
      );
      return;
    }

    setCases((old) =>
      old.map((x) =>
        x.id === item.id ? data : x
      )
    );

    setMessage(
      data.is_published
        ? "تم نشر الحالة."
        : "تم إخفاء الحالة."
    );
  }

  async function deleteCase(id: string) {
    if (
      !confirm(
        "هل تريد حذف هذه الحالة نهائياً؟"
      )
    ) {
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("doctor_cases")
        .delete()
        .eq("id", id);

    if (deleteError) {
      setError(
        "تعذر حذف الحالة: " +
          deleteError.message
      );
      return;
    }

    setCases((old) =>
      old.filter((x) => x.id !== id)
    );

    if (editingId === id) {
      cancelEdit();
    }

    setMessage("تم حذف الحالة.");
  }

  function removeCertificate(index: number) {
    setCertificates((old) =>
      old.filter((_, i) => i !== index)
    );

    setMessage(
      "تم حذف الشهادة من الملف. اضغط حفظ المعلومات."
    );
  }

  async function copyMyWebsite() {
    if (!doctor) return;

    const doctorPath =
      doctor.slug || doctor.id;

    const url =
      `${window.location.origin}/doctor/${doctorPath}`;

    try {
      await navigator.clipboard.writeText(url);

      setMessage(
        "تم نسخ رابط موقعك بنجاح."
      );

      setError("");
    } catch {
      setError(
        "تعذر نسخ الرابط."
      );
    }
  }

  async function submitRenewal(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!doctor) return;

    if (!renewalWhatsapp.trim()) {
      setError("اكتب رقم الواتساب.");
      return;
    }

    if (!renewalTransferNumber.trim()) {
      setError("اكتب رقم/مرجع عملية التحويل.");
      return;
    }

    if (!renewalReceipt) {
      setError("ارفع صورة وصل التحويل.");
      return;
    }

    setRenewalSending(true);
    setError("");
    setMessage("");

    try {
      const receiptUrl = await uploadImage(
        renewalReceipt,
        CERTIFICATE_BUCKET,
        "subscription-receipts"
      );

      const durationDays =
        Number(renewalDuration);

      const { error: insertError } =
        await supabase
          .from("subscription_requests")
          .insert({
            doctor_id: doctor.id,
            doctor_name: doctor.full_name,
            whatsapp_number:
              renewalWhatsapp.trim(),
            plan: renewalPlan,
            duration_days: durationDays,
            payment_method:
              renewalPaymentMethod,
            transfer_number:
              renewalTransferNumber.trim(),
            receipt_url: receiptUrl,
            status: "pending",
          });

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      setRenewalPending(true);
      setRenewalOpen(false);
      setRenewalTransferNumber("");
      setRenewalReceipt(null);

      setMessage(
        "تم إرسال طلب التجديد إلى الإدارة. سيتم تمديد اشتراكك بعد الموافقة."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر إرسال طلب التجديد."
      );
    } finally {
      setRenewalSending(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/doctor-login");
  }

  if (loading) {
    return (
      <main style={loadingStyle} dir="rtl">
        جاري تحميل لوحة الطبيب...
      </main>
    );
  }

  return (
    <main dir="rtl" style={pageStyle}>
      <div style={containerStyle}>

        <header style={headerStyle}>
          <div>
            <small style={gold}>
              DENTAL MOTION
            </small>

            <h1 style={headerTitle}>
              لوحة الطبيب
            </h1>

            <p style={muted}>
              إدارة معلوماتك المهنية والصور والحالات.
            </p>
          </div>

          <div style={actions}>
            <button
              type="button"
              style={secondary}
              onClick={() => {
                if (!doctor) return;

                router.push(
                  `/doctor/${doctor.slug || doctor.id}`
                );
              }}
            >
              عرض موقعي
            </button>

            <button
              type="button"
              style={secondary}
              onClick={copyMyWebsite}
            >
              نسخ رابط موقعي
            </button>

            <button
              type="button"
              style={danger}
              onClick={logout}
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        {message && (
          <div style={success}>
            {message}
          </div>
        )}

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={saveDoctor}>
          <section style={section}>

            <div style={sectionHeader}>
              <div>
                <small style={gold}>
                  PROFILE
                </small>

                <h2 style={sectionTitle}>
                  معلومات الطبيب
                </h2>
              </div>

              <button
                type="submit"
                disabled={
                  saving || uploading
                }
                style={primary}
              >
                {saving
                  ? "جاري الحفظ..."
                  : "حفظ المعلومات"}
              </button>
            </div>

            <div style={grid}>
              <Field
                label="اسم الطبيب"
                value={fullName}
                onChange={setFullName}
                required
              />

              <Field
                label="الاختصاص"
                value={specialty}
                onChange={setSpecialty}
                required
              />

              <Field
                label="الاختصاص الفرعي"
                value={subSpecialty}
                onChange={setSubSpecialty}
              />

              <Field
                label="رقم الهاتف"
                value={phone}
                onChange={setPhone}
              />

              <Field
                label="اسم العيادة"
                value={clinicName}
                onChange={setClinicName}
              />

              <Field
                label="عنوان العيادة"
                value={clinicAddress}
                onChange={setClinicAddress}
              />

              <Field
                label="سنوات الخبرة"
                value={yearsExperience}
                onChange={setYearsExperience}
                type="number"
              />
            </div>

            <label style={label}>
              النبذة المهنية
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              rows={5}
              style={textarea}
              placeholder="اكتب نبذة عن الطبيب..."
            />

            <div style={uploadSection}>
              <h3 style={subTitle}>
                الصورة الشخصية
              </h3>

              <p style={muted}>
                اختر الصورة مباشرة من الهاتف أو الكمبيوتر.
              </p>

              <label style={uploadButton}>
                {uploading
                  ? "جاري الرفع..."
                  : "اختيار الصورة"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={chooseProfileImage}
                  disabled={uploading}
                  hidden
                />
              </label>

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="الصورة الشخصية"
                  style={profileImageStyle}
                />
              ) : (
                <div style={placeholder}>
                  لا توجد صورة
                </div>
              )}
            </div>

            <div style={uploadSection}>
              <h3 style={subTitle}>
                الشهادات والمؤهلات
              </h3>

              <p style={muted}>
                يمكنك اختيار أكثر من صورة شهادة من جهازك.
              </p>

              <label style={uploadButton}>
                إضافة شهادات

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={chooseCertificates}
                  disabled={uploading}
                  hidden
                />
              </label>

              {certificates.length > 0 && (
                <div style={certificateGrid}>
                  {certificates.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        style={certificateCard}
                      >
                        <div
                          style={certificateFrame}
                        >
                          <img
                            src={url}
                            alt={`شهادة ${
                              index + 1
                            }`}
                            style={certificateImage}
                          />
                        </div>

                        <button
                          type="button"
                          style={smallDanger}
                          onClick={() =>
                            removeCertificate(
                              index
                            )
                          }
                        >
                          حذف الشهادة
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        </form>

        {/* ============================= */}
        {/* إضافة حالة */}
        {/* ============================= */}

        <section style={section}>
          <small style={gold}>
            BEFORE / AFTER
          </small>

          <h2 style={sectionTitle}>
            إضافة حالة قبل وبعد
          </h2>

          <div style={planUsageBox}>
            <div>
              <strong>
                باقتك: {currentPlan === "premium" ? "المميزة" : "العادية"}
              </strong>
              <p style={muted}>
                الحالات المنشورة: {publishedCasesCount} من {publishedCasesLimit}
              </p>
            </div>
            <span style={canPublishMore ? quotaOk : quotaFull}>
              {canPublishMore
                ? `متبقي ${publishedCasesLimit - publishedCasesCount}`
                : "وصلت للحد الأقصى"}
            </span>
          </div>

          <p style={muted}>
            يمكنك إضافة حالات إضافية، لكن النشر العام يخضع لحد الباقة.
            إذا وصلت للحد ستُحفظ الحالة الجديدة كمخفية إلى أن تخفي حالة أخرى أو ترقي الباقة.
          </p>

          <form onSubmit={addCase}>
            <Field
              label="عنوان الحالة"
              value={caseTitle}
              onChange={setCaseTitle}
              required
            />

            <label style={label}>
              وصف الحالة
            </label>

            <textarea
              value={caseDescription}
              onChange={(e) =>
                setCaseDescription(
                  e.target.value
                )
              }
              rows={4}
              style={textarea}
              placeholder="مثال: تبييض وترميم الأسنان الأمامية..."
            />

            <div style={beforeAfterGrid}>
              <ImagePicker
                title="صورة قبل"
                image={beforeImage}
                onChange={(e) =>
                  chooseCaseImage(
                    e,
                    "before"
                  )
                }
              />

              <ImagePicker
                title="صورة بعد"
                image={afterImage}
                onChange={(e) =>
                  chooseCaseImage(
                    e,
                    "after"
                  )
                }
              />
            </div>

            <button
              type="submit"
              disabled={
                caseSaving || uploading
              }
              style={{
                ...primary,
                width: "100%",
                marginTop: 20,
              }}
            >
              {caseSaving
                ? "جاري الحفظ..."
                : "إضافة الحالة"}
            </button>
          </form>
        </section>

        {/* ============================= */}
        {/* الحالات الموجودة */}
        {/* ============================= */}

        <section style={section}>
          <small style={gold}>
            YOUR CASES
          </small>

          <h2 style={sectionTitle}>
            حالاتك
          </h2>

          {cases.length === 0 ? (
            <div style={empty}>
              لا توجد حالات مضافة حالياً.
            </div>
          ) : (
            <div style={casesGrid}>
              {cases.map((item) => (
                <article
                  key={item.id}
                  style={caseCard}
                >
                  {editingId === item.id ? (
                    <div style={editingBox}>

                      <Field
                        label="عنوان الحالة"
                        value={editingTitle}
                        onChange={
                          setEditingTitle
                        }
                        required
                      />

                      <label style={label}>
                        الوصف
                      </label>

                      <textarea
                        value={
                          editingDescription
                        }
                        onChange={(e) =>
                          setEditingDescription(
                            e.target.value
                          )
                        }
                        rows={4}
                        style={textarea}
                      />

                      <div
                        style={
                          beforeAfterGrid
                        }
                      >
                        <ImagePicker
                          title="صورة قبل"
                          image={
                            editingBefore
                          }
                          onChange={(e) =>
                            editCaseImage(
                              e,
                              "before"
                            )
                          }
                        />

                        <ImagePicker
                          title="صورة بعد"
                          image={
                            editingAfter
                          }
                          onChange={(e) =>
                            editCaseImage(
                              e,
                              "after"
                            )
                          }
                        />
                      </div>

                      <div style={actions}>
                        <button
                          type="button"
                          style={primary}
                          disabled={
                            caseSaving ||
                            uploading
                          }
                          onClick={
                            saveCaseEdit
                          }
                        >
                          {caseSaving
                            ? "جاري الحفظ..."
                            : "حفظ التعديل"}
                        </button>

                        <button
                          type="button"
                          style={secondary}
                          onClick={
                            cancelEdit
                          }
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* صور الحالة */}
                      <div
                        style={caseImages}
                      >
                        <ImageResult
                          label="BEFORE"
                          src={
                            item.before_image
                          }
                        />

                        <ImageResult
                          label="AFTER"
                          src={
                            item.after_image
                          }
                        />
                      </div>

                      <div
                        style={{
                          padding: 20,
                        }}
                      >
                        <div
                          style={
                            caseTitleRow
                          }
                        >
                          <h3
                            style={
                              caseTitleStyle
                            }
                          >
                            {item.title}
                          </h3>

                          <span
                            style={
                              item.is_published
                                ? published
                                : hidden
                            }
                          >
                            {item.is_published
                              ? "منشورة"
                              : "مخفية"}
                          </span>
                        </div>

                        {item.description && (
                          <p style={muted}>
                            {
                              item.description
                            }
                          </p>
                        )}

                        <div
                          style={actions}
                        >
                          <button
                            type="button"
                            style={
                              secondary
                            }
                            onClick={() =>
                              editCase(
                                item
                              )
                            }
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            style={
                              publish
                            }
                            onClick={() =>
                              togglePublish(
                                item
                              )
                            }
                          >
                            {item.is_published
                              ? "إخفاء"
                              : "نشر"}
                          </button>

                          <button
                            type="button"
                            style={danger}
                            onClick={() =>
                              deleteCase(
                                item.id
                              )
                            }
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ============================= */}
        {/* الاشتراك */}
        {/* ============================= */}

        <section style={section}>
          <small style={gold}>
            SUBSCRIPTION
          </small>

          <h2 style={sectionTitle}>
            الاشتراك
          </h2>

          <div style={subscription}>
            <h3>
              {subscriptionReallyActive
                ? "الاشتراك فعال"
                : subscriptionExpired
                  ? "الاشتراك منتهي"
                  : "الاشتراك غير مفعل"}
            </h3>

            {subscriptionExpired && (
              <div style={expiredSubscriptionBox}>
                <strong>
                  انتهى اشتراكك
                </strong>

                <p style={muted}>
                  موقعك العام متوقف حالياً، لكن معلوماتك
                  وصورك وحالاتك محفوظة. أرسل طلب تجديد
                  حتى يعود موقعك للعمل بنفس الرابط.
                </p>
              </div>
            )}

            <div style={grid}>
              <Info
                title="البداية"
                value={formatDate(
                  doctor?.subscription_started_at
                )}
              />

              <Info
                title="الانتهاء"
                value={formatDate(
                  doctor?.subscription_expires_at
                )}
              />

              <Info
                title="حالة الاعتماد"
                value={
                  doctor?.is_approved
                    ? "معتمد"
                    : "بانتظار اعتماد الإدارة"
                }
              />

              <Info
                title="الباقة"
                value={
                  currentPlan === "premium"
                    ? "المميزة"
                    : "العادية"
                }
              />

              <Info
                title="الحالات المنشورة"
                value={`${publishedCasesCount} / ${publishedCasesLimit}`}
              />
            </div>

            <p style={muted}>
              حالة الاشتراك تُدار من نظام الاشتراكات والإدارة،
              ولا يتمكن الطبيب من تفعيلها يدوياً.
            </p>

            {renewalPending ? (
              <div style={renewalPendingBox}>
                طلب التجديد قيد مراجعة الإدارة.
              </div>
            ) : (
              <button
                type="button"
                style={{
                  ...primary,
                  marginTop: 16,
                  background:
                    subscriptionExpired
                      ? "#25D366"
                      : "#008cff",
                }}
                onClick={() =>
                  setRenewalOpen((old) => !old)
                }
              >
                {renewalOpen
                  ? "إغلاق طلب التجديد"
                  : subscriptionExpired
                    ? "تجديد الاشتراك وإعادة تشغيل الموقع"
                    : "تجديد / ترقية الاشتراك"}
              </button>
            )}

            {renewalOpen && !renewalPending && (
              <form
                onSubmit={submitRenewal}
                style={renewalForm}
              >
                <h3 style={subTitle}>
                  طلب تجديد الاشتراك
                </h3>

                <div style={grid}>
                  <div>
                    <label style={label}>
                      الباقة
                    </label>
                    <select
                      value={renewalPlan}
                      onChange={(e) =>
                        setRenewalPlan(
                          e.target.value as
                            | "basic"
                            | "premium"
                        )
                      }
                      style={input}
                    >
                      <option value="basic">
                        العادية
                      </option>
                      <option value="premium">
                        المميزة
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={label}>
                      المدة
                    </label>
                    <select
                      value={renewalDuration}
                      onChange={(e) =>
                        setRenewalDuration(
                          e.target.value
                        )
                      }
                      style={input}
                    >
                      <option value="30">
                        30 يوم
                      </option>
                      <option value="90">
                        90 يوم
                      </option>
                      <option value="180">
                        180 يوم
                      </option>
                      <option value="365">
                        سنة
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={label}>
                      طريقة الدفع
                    </label>
                    <select
                      value={
                        renewalPaymentMethod
                      }
                      onChange={(e) =>
                        setRenewalPaymentMethod(
                          e.target.value as
                            | "zaincash"
                            | "kcard"
                        )
                      }
                      style={input}
                    >
                      <option value="zaincash">
                        زين كاش
                      </option>
                      <option value="kcard">
                        كي كارد
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={label}>
                      رقم الدفع
                    </label>
                    <div style={paymentNumberBox}>
                      {renewalPaymentMethod ===
                      "zaincash"
                        ? "07803447144"
                        : "7159038244"}
                    </div>
                  </div>

                  <Field
                    label="رقم الواتساب"
                    value={renewalWhatsapp}
                    onChange={
                      setRenewalWhatsapp
                    }
                    required
                  />

                  <Field
                    label="رقم / مرجع التحويل"
                    value={
                      renewalTransferNumber
                    }
                    onChange={
                      setRenewalTransferNumber
                    }
                    required
                  />
                </div>

                <div style={uploadSection}>
                  <label style={label}>
                    صورة وصل التحويل
                  </label>

                  <label style={uploadButton}>
                    {renewalReceipt
                      ? renewalReceipt.name
                      : "اختيار صورة الوصل"}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        setRenewalReceipt(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={renewalSending}
                  style={{
                    ...primary,
                    width: "100%",
                    marginTop: 20,
                  }}
                >
                  {renewalSending
                    ? "جاري إرسال الطلب..."
                    : "إرسال طلب التجديد"}
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

function Field({
  label: title,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={label}>
        {title}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={input}
      />
    </div>
  );
}

function ImagePicker({
  title,
  image,
  onChange,
}: {
  title: string;
  image: string | null;
  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <div style={imagePicker}>
      <h3 style={subTitle}>
        {title}
      </h3>

      <div style={pickerImageFrame}>
        {image ? (
          <img
            src={image}
            alt={title}
            style={casePreview}
          />
        ) : (
          <div style={casePlaceholder}>
            لم يتم اختيار صورة
          </div>
        )}
      </div>

      <label style={uploadButton}>
        {image
          ? "استبدال الصورة"
          : "اختيار صورة"}

        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          hidden
        />
      </label>
    </div>
  );
}

function ImageResult({
  label,
  src,
}: {
  label: string;
  src: string;
}) {
  return (
    <div style={caseImageColumn}>
      <div style={imageLabel}>
        {label}
      </div>

      <div style={caseImageFrame}>
        <img
          src={src}
          alt={label}
          style={caseImage}
        />
      </div>
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={info}>
      <small>{title}</small>

      <strong
        style={{
          display: "block",
          marginTop: 8,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) return "غير محدد";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "غير محدد";
  }

  return new Intl.DateTimeFormat(
    "ar-IQ",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 5%,rgba(0,140,255,.13),transparent 35%),#020409",
  color: "#fff",
  padding: "30px 16px 80px",
  fontFamily: "Arial,sans-serif",
};

const loadingStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#020409",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  paddingBottom: 25,
  marginBottom: 25,
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const headerTitle: React.CSSProperties = {
  fontFamily: "Georgia,serif",
  fontSize: 38,
  fontWeight: 400,
  margin: "8px 0",
};

const section: React.CSSProperties = {
  background: "rgba(3,8,18,.86)",
  border:
    "1px solid rgba(0,140,255,.18)",
  padding: 30,
  marginBottom: 25,
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Georgia,serif",
  fontWeight: 400,
  fontSize: 28,
  margin: "8px 0 20px",
};

const subTitle: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 13,
  margin: "10px 0",
};

const gold: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 10,
  letterSpacing: ".18em",
};

const muted: React.CSSProperties = {
  color: "rgba(255,255,255,.48)",
  fontSize: 12,
  lineHeight: 1.8,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(240px,1fr))",
  gap: 18,
};

const label: React.CSSProperties = {
  display: "block",
  color: "#c7a85d",
  fontSize: 10,
  margin: "18px 0 8px",
};

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 14,
  background: "rgba(0,0,0,.35)",
  color: "#fff",
  border:
    "1px solid rgba(0,140,255,.2)",
  outline: "none",
  fontSize: 12,
};

const textarea: React.CSSProperties = {
  ...input,
  resize: "vertical",
  lineHeight: 1.8,
};

const primary: React.CSSProperties = {
  padding: "13px 22px",
  background: "#008cff",
  color: "#fff",
  border: 0,
  cursor: "pointer",
};

const secondary: React.CSSProperties = {
  padding: "11px 18px",
  background: "rgba(0,140,255,.08)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.3)",
  cursor: "pointer",
};

const danger: React.CSSProperties = {
  padding: "11px 18px",
  background: "transparent",
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,70,70,.3)",
  cursor: "pointer",
};

const publish: React.CSSProperties = {
  ...secondary,
  color: "#72e6a2",
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 18,
};

const uploadSection: React.CSSProperties = {
  marginTop: 30,
  paddingTop: 25,
  borderTop:
    "1px solid rgba(255,255,255,.08)",
};

const uploadButton: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 20px",
  background: "rgba(0,140,255,.1)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.35)",
  cursor: "pointer",
  fontSize: 11,
};

const profileImageStyle: React.CSSProperties = {
  width: 180,
  height: 180,
  objectFit: "cover",
  borderRadius: "50%",
  marginTop: 20,
  border:
    "2px solid rgba(199,168,93,.5)",
};

const placeholder: React.CSSProperties = {
  width: 180,
  height: 180,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border:
    "1px dashed rgba(255,255,255,.15)",
  color: "rgba(255,255,255,.35)",
  marginTop: 20,
};

const certificateGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginTop: 20,
};

const certificateCard: React.CSSProperties = {
  padding: 10,
  background: "rgba(0,0,0,.25)",
  border:
    "1px solid rgba(255,255,255,.08)",
};

const certificateFrame: React.CSSProperties = {
  height: 180,
  background: "#080c14",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const certificateImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const smallDanger: React.CSSProperties = {
  width: "100%",
  marginTop: 8,
  padding: 8,
  background: "transparent",
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,70,70,.25)",
  cursor: "pointer",
};

/* =====================================
   BEFORE / AFTER
   ===================================== */

const beforeAfterGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
  marginTop: 20,
};

const imagePicker: React.CSSProperties = {
  padding: 20,
  textAlign: "center",
  background: "rgba(0,0,0,.18)",
  border:
    "1px dashed rgba(0,140,255,.35)",
};

const pickerImageFrame: React.CSSProperties = {
  width: "100%",
  height: 320,
  background: "#080c14",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  marginBottom: 15,
};

const casePreview: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const casePlaceholder: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#080c14",
  color: "rgba(255,255,255,.3)",
};

const casesGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(420px,1fr))",
  gap: 25,
};

const caseCard: React.CSSProperties = {
  overflow: "hidden",
  background: "rgba(0,0,0,.2)",
  border:
    "1px solid rgba(255,255,255,.08)",
};

const caseImages: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  background: "#03060c",
};

const caseImageColumn: React.CSSProperties = {
  minWidth: 0,
  background: "#080c14",
};

const caseImageFrame: React.CSSProperties = {
  width: "100%",
  height: 330,
  background: "#080c14",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const caseImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const imageLabel: React.CSSProperties = {
  padding: 8,
  textAlign: "center",
  background: "rgba(0,0,0,.85)",
  color: "#c7a85d",
  fontSize: 9,
  letterSpacing: ".15em",
};

const caseTitleRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const caseTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.5,
};

const editingBox: React.CSSProperties = {
  padding: 20,
};

const published: React.CSSProperties = {
  color: "#72e6a2",
  fontSize: 9,
  whiteSpace: "nowrap",
};

const hidden: React.CSSProperties = {
  color: "#ffcf70",
  fontSize: 9,
  whiteSpace: "nowrap",
};

const planUsageBox: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  padding: 16,
  marginBottom: 16,
  background: "rgba(0,140,255,.06)",
  border: "1px solid rgba(0,140,255,.18)",
};

const quotaOk: React.CSSProperties = {
  color: "#72e6a2",
  fontSize: 11,
};

const quotaFull: React.CSSProperties = {
  color: "#ffcf70",
  fontSize: 11,
};

const expiredSubscriptionBox: React.CSSProperties = {
  marginBottom: 18,
  padding: 16,
  background: "rgba(255,70,70,.07)",
  border: "1px solid rgba(255,70,70,.25)",
  color: "#ff9b9b",
};

const renewalForm: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  background: "rgba(0,140,255,.04)",
  border: "1px solid rgba(0,140,255,.18)",
};

const paymentNumberBox: React.CSSProperties = {
  ...input,
  color: "#72e6a2",
  fontWeight: 700,
  direction: "ltr",
  textAlign: "left",
};

const renewalPendingBox: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  color: "#ffcf70",
  background: "rgba(255,190,50,.06)",
  border: "1px solid rgba(255,190,50,.2)",
};

const subscription: React.CSSProperties = {
  padding: 25,
  background: "rgba(0,0,0,.22)",
  border:
    "1px solid rgba(255,255,255,.08)",
};

const info: React.CSSProperties = {
  padding: 15,
  background: "rgba(3,8,18,.5)",
  border:
    "1px solid rgba(255,255,255,.07)",
};

const success: React.CSSProperties = {
  padding: 13,
  marginBottom: 20,
  background: "rgba(0,180,255,.08)",
  border:
    "1px solid rgba(0,180,255,.25)",
  color: "#7dccff",
};

const errorBox: React.CSSProperties = {
  padding: 13,
  marginBottom: 20,
  background: "rgba(255,40,40,.08)",
  border:
    "1px solid rgba(255,70,70,.3)",
  color: "#ff9b9b",
};

const empty: React.CSSProperties = {
  padding: 35,
  textAlign: "center",
  color: "rgba(255,255,255,.35)",
  border:
    "1px dashed rgba(255,255,255,.1)",
};