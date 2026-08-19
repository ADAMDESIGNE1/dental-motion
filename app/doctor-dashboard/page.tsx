"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";

type PatientReview = {
  id: string;
  doctor_id: string;
  patient_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
  approved_at: string | null;
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

type SectionStat = {
  section_key: string;
  click_count: number;
};

type ServiceStat = {
  service_name: string;
  click_count: number;
};

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
  featured_active: boolean | null;
  featured_started_at: string | null;
  featured_until: string | null;
  subscription_active: boolean;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  is_approved: boolean;
  subscription_plan: string | null;
  subscription_duration_days: number | null;
};

type DoctorStats = {
  page_views: number;
  whatsapp_clicks: number;
  appointment_requests: number;
  phone_clicks: number;
  profile_shares: number;
  address_copies: number;
};

type DoctorCase = {
  id: string;
  doctor_id: string;
  title: string;
  description: string | null;
  before_image: string;
  after_image: string;
  category: string | null;
  is_published: boolean;
};

const PROFILE_BUCKET = "doctor-images";
const CERTIFICATE_BUCKET = "doctor-certificates";
const CASE_BUCKET = "doctor-cases";

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [cases, setCases] = useState<DoctorCase[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    page_views: 0,
    whatsapp_clicks: 0,
    appointment_requests: 0,
    phone_clicks: 0,
    profile_shares: 0,
    address_copies: 0,
  });
  const [sectionStats, setSectionStats] =
    useState<SectionStat[]>([]);
  const [serviceStats, setServiceStats] =
    useState<ServiceStat[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");

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

  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  const [siteTheme, setSiteTheme] =
    useState<SiteTheme>("dark-blue");
  const [themeSaving, setThemeSaving] =
    useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] =
    useState("");
  const [clinicDays, setClinicDays] =
    useState("");
  const [clinicHoursFrom, setClinicHoursFrom] =
    useState("");
  const [clinicHoursTo, setClinicHoursTo] =
    useState("");
  const [instagramUrl, setInstagramUrl] =
    useState("");
  const [tiktokUrl, setTiktokUrl] =
    useState("");
  const [facebookUrl, setFacebookUrl] =
    useState("");

  const [faqItems, setFaqItems] =
    useState<FaqItem[]>([]);
  const [faqQuestion, setFaqQuestion] =
    useState("");
  const [faqAnswer, setFaqAnswer] =
    useState("");

  const [clinicLogo, setClinicLogo] =
    useState<string | null>(null);
  const [coverImage, setCoverImage] =
    useState<string | null>(null);

  const [offers, setOffers] =
    useState<OfferItem[]>([]);
  const [offerTitle, setOfferTitle] =
    useState("");
  const [offerDescription, setOfferDescription] =
    useState("");
  const [offerExpiresAt, setOfferExpiresAt] =
    useState("");

  const [patientReviews, setPatientReviews] =
    useState<PatientReview[]>([]);
  const [reviewSavingId, setReviewSavingId] =
    useState<string | null>(null);

  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [caseCategory, setCaseCategory] =
    useState("عام");
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCategory, setEditingCategory] =
    useState("عام");
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
      .maybeSingle();

    if (doctorError) {
      console.error(
        "LOAD DOCTOR ERROR:",
        doctorError.message,
        doctorError.code,
        doctorError.details,
        doctorError.hint
      );

      setError(
        `تعذر تحميل معلومات الطبيب: ${doctorError.message}`
      );
      setLoading(false);
      return;
    }

    /*
     * إذا الجلسة الحالية للأدمن أو لأي حساب
     * ما عنده سجل داخل doctors، ما نعاملها
     * كخطأ قاعدة بيانات. نطلع الجلسة ونرجع
     * لصفحة دخول الطبيب.
     */
    if (!data) {
      await supabase.auth.signOut();
      setDoctor(null);
      setLoading(false);
      router.replace("/doctor-login");
      return;
    }

    setDoctor(data);

    if (typeof window !== "undefined") {
      setWebsiteUrl(
        `${window.location.origin}/doctor/${data.slug || data.id}`
      );
    }

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

    setServices(
      Array.isArray(data.services)
        ? data.services.filter(
            (item: unknown): item is string =>
              typeof item === "string" &&
              item.trim().length > 0
          )
        : []
    );

    setSiteTheme(
      data.site_theme === "black-gold" ||
      data.site_theme === "clean-white"
        ? data.site_theme
        : "dark-blue"
    );
    setGoogleMapsUrl(
      data.google_maps_url || ""
    );
    setClinicDays(
      data.clinic_days || ""
    );
    setClinicHoursFrom(
      data.clinic_hours_from || ""
    );
    setClinicHoursTo(
      data.clinic_hours_to || ""
    );
    setInstagramUrl(
      data.instagram_url || ""
    );
    setTiktokUrl(
      data.tiktok_url || ""
    );
    setFacebookUrl(
      data.facebook_url || ""
    );

    setFaqItems(
      Array.isArray(data.faq_items)
        ? data.faq_items
            .filter(
              (item: unknown): item is FaqItem =>
                Boolean(
                  item &&
                    typeof item === "object" &&
                    "question" in item &&
                    "answer" in item &&
                    typeof (item as FaqItem).question === "string" &&
                    typeof (item as FaqItem).answer === "string"
                )
            )
            .slice(0, 10)
        : []
    );

    setClinicLogo(
      data.clinic_logo || null
    );
    setCoverImage(
      data.cover_image || null
    );

    setOffers(
      Array.isArray(data.offers)
        ? data.offers
            .filter(
              (item: unknown): item is OfferItem =>
                Boolean(
                  item &&
                    typeof item === "object" &&
                    "id" in item &&
                    "title" in item &&
                    "description" in item &&
                    "expires_at" in item
                )
            )
            .slice(0, 20)
        : []
    );

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

    const {
      data: reviewData,
      error: reviewError,
    } = await supabase
      .from("doctor_reviews")
      .select(
        "id, doctor_id, patient_name, rating, review_text, is_approved, created_at, approved_at"
      )
      .eq("doctor_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (reviewError) {
      console.error(reviewError);
      setError(
        "تعذر تحميل آراء المرضى: " +
          reviewError.message
      );
    } else {
      setPatientReviews(
        (reviewData || []) as PatientReview[]
      );
    }

    const {
      data: statsData,
      error: statsError,
    } = await supabase
      .from("doctor_stats")
      .select(
        "page_views, whatsapp_clicks, appointment_requests, phone_clicks, profile_shares, address_copies"
      )
      .eq("doctor_id", user.id)
      .maybeSingle();

    if (statsError) {
      console.error(
        "LOAD STATS:",
        statsError
      );
    } else if (statsData) {
      setStats({
        page_views:
          Number(statsData.page_views) || 0,
        whatsapp_clicks:
          Number(statsData.whatsapp_clicks) || 0,
        appointment_requests:
          Number(statsData.appointment_requests) || 0,
        phone_clicks:
          Number(statsData.phone_clicks) || 0,
        profile_shares:
          Number(statsData.profile_shares) || 0,
        address_copies:
          Number(statsData.address_copies) || 0,
      });
    }

    const {
      data: sectionStatsData,
      error: sectionStatsError,
    } = await supabase
      .from("doctor_section_stats")
      .select(
        "section_key, click_count"
      )
      .eq("doctor_id", user.id)
      .order("click_count", {
        ascending: false,
      })
      .limit(8);

    if (sectionStatsError) {
      console.error(
        "LOAD SECTION STATS:",
        sectionStatsError
      );
    } else {
      setSectionStats(
        (sectionStatsData ||
          []) as SectionStat[]
      );
    }

    const {
      data: serviceStatsData,
      error: serviceStatsError,
    } = await supabase
      .from("doctor_service_stats")
      .select(
        "service_name, click_count"
      )
      .eq("doctor_id", user.id)
      .order("click_count", {
        ascending: false,
      })
      .limit(8);

    if (serviceStatsError) {
      console.error(
        "LOAD SERVICE STATS:",
        serviceStatsError
      );
    } else {
      setServiceStats(
        (serviceStatsData ||
          []) as ServiceStat[]
      );
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

  async function chooseBrandingImage(
    e: ChangeEvent<HTMLInputElement>,
    kind: "logo" | "cover"
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const url =
        await uploadImage(
          file,
          PROFILE_BUCKET,
          kind === "logo"
            ? "clinic-logo"
            : "cover"
        );

      if (kind === "logo") {
        setClinicLogo(url);
        setMessage(
          "تم رفع شعار العيادة. اضغط حفظ المعلومات."
        );
      } else {
        setCoverImage(url);
        setMessage(
          "تم رفع صورة الـCover. اضغط حفظ المعلومات."
        );
      }
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

  function addOffer() {
    const title =
      offerTitle.trim();
    const description =
      offerDescription.trim();

    if (
      !title ||
      !offerExpiresAt
    ) {
      setError(
        "اكتب عنوان العرض وتاريخ الانتهاء."
      );
      return;
    }

    const expiry =
      new Date(
        `${offerExpiresAt}T23:59:59`
      );

    if (
      Number.isNaN(
        expiry.getTime()
      ) ||
      expiry.getTime() <=
        Date.now()
    ) {
      setError(
        "اختار تاريخ انتهاء بالمستقبل."
      );
      return;
    }

    if (offers.length >= 10) {
      setError(
        "الحد الأعلى 10 عروض."
      );
      return;
    }

    const id =
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    setOffers((old) => [
      ...old,
      {
        id,
        title,
        description,
        expires_at:
          expiry.toISOString(),
      },
    ]);

    setOfferTitle("");
    setOfferDescription("");
    setOfferExpiresAt("");
    setError("");
    setMessage(
      "تمت إضافة العرض. اضغط حفظ المعلومات."
    );
  }

  function removeOffer(
    id: string
  ) {
    setOffers((old) =>
      old.filter(
        (item) =>
          item.id !== id
      )
    );

    setMessage(
      "تم حذف العرض من القائمة. اضغط حفظ المعلومات."
    );
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
          services,
          site_theme:
            currentPlan === "premium"
              ? siteTheme
              : "dark-blue",
          google_maps_url:
            googleMapsUrl.trim() || null,
          clinic_days:
            clinicDays.trim() || null,
          clinic_hours_from:
            clinicHoursFrom || null,
          clinic_hours_to:
            clinicHoursTo || null,
          instagram_url:
            instagramUrl.trim() || null,
          tiktok_url:
            tiktokUrl.trim() || null,
          facebook_url:
            facebookUrl.trim() || null,
          faq_items:
            faqItems.slice(0, 10),
          clinic_logo:
            clinicLogo,
          cover_image:
            coverImage,
          offers:
            offers.slice(0, 10),
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

  function addService() {
    if (currentPlan !== "premium") {
      setError(
        "إضافة الخدمات متاحة للباقة المميزة."
      );
      return;
    }

    const value = newService.trim();

    if (!value) return;

    if (services.length >= 20) {
      setError(
        "يمكنك إضافة لحد 20 خدمة."
      );
      return;
    }

    const duplicated = services.some(
      (item) =>
        item.toLowerCase() ===
        value.toLowerCase()
    );

    if (duplicated) {
      setError("هذه الخدمة مضافة مسبقاً.");
      return;
    }

    setServices((old) => [...old, value]);
    setNewService("");
    setError("");
    setMessage(
      "تمت إضافة الخدمة. اضغط حفظ المعلومات لتثبيتها."
    );
  }

  function removeService(index: number) {
    setServices((old) =>
      old.filter((_, itemIndex) =>
        itemIndex !== index
      )
    );
    setMessage(
      "تم حذف الخدمة من القائمة. اضغط حفظ المعلومات لتثبيت التغيير."
    );
  }

  async function approvePatientReview(
    item: PatientReview
  ) {
    if (currentPlan !== "premium") {
      setError(
        "نشر آراء المرضى متاح للباقة المميزة."
      );
      return;
    }

    const approvedCount =
      patientReviews.filter(
        (review) => review.is_approved
      ).length;

    if (
      !item.is_approved &&
      approvedCount >= 20
    ) {
      setError(
        "وصلت إلى 20 رأي منشور. احذف أو أخفِ رأياً منشوراً قبل نشر رأي جديد."
      );
      return;
    }

    setReviewSavingId(item.id);
    setError("");
    setMessage("");

    const nextApproved =
      !item.is_approved;

    const {
      data,
      error: updateError,
    } = await supabase
      .from("doctor_reviews")
      .update({
        is_approved: nextApproved,
        approved_at: nextApproved
          ? new Date().toISOString()
          : null,
      })
      .eq("id", item.id)
      .select(
        "id, doctor_id, patient_name, rating, review_text, is_approved, created_at, approved_at"
      )
      .single();

    if (updateError) {
      setError(
        "تعذر تحديث الرأي: " +
          updateError.message
      );
    } else {
      setPatientReviews((old) =>
        old.map((review) =>
          review.id === item.id
            ? (data as PatientReview)
            : review
        )
      );

      setMessage(
        nextApproved
          ? "تم نشر رأي المريض في الموقع."
          : "تم إخفاء الرأي من الموقع."
      );
    }

    setReviewSavingId(null);
  }

  async function deletePatientReview(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "حذف هذا الرأي نهائياً؟"
      );

    if (!confirmed) return;

    setReviewSavingId(id);
    setError("");
    setMessage("");

    const { error: deleteError } =
      await supabase
        .from("doctor_reviews")
        .delete()
        .eq("id", id);

    if (deleteError) {
      setError(
        "تعذر حذف الرأي: " +
          deleteError.message
      );
    } else {
      setPatientReviews((old) =>
        old.filter(
          (review) =>
            review.id !== id
        )
      );
      setMessage("تم حذف الرأي.");
    }

    setReviewSavingId(null);
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
    currentPlan === "premium" ? 150 : 2;

  const canPublishMore =
    publishedCasesCount < publishedCasesLimit;

  async function changeSiteTheme(
    theme: SiteTheme
  ) {
    if (
      currentPlan !== "premium" ||
      !doctor
    ) {
      setError(
        "تغيير الثيم متاح للباقة المميزة."
      );
      return;
    }

    if (siteTheme === theme) {
      setMessage(
        "هذا هو الثيم الحالي."
      );
      return;
    }

    const previousTheme =
      siteTheme;

    // نخلي التغيير يبان فوراً بالـ Dashboard
    // وبعدها نحفظه بقاعدة البيانات.
    setSiteTheme(theme);
    setThemeSaving(true);
    setError("");
    setMessage(
      "جاري حفظ الثيم..."
    );

    const {
      data,
      error: themeError,
    } = await supabase
      .from("doctors")
      .update({
        site_theme: theme,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", doctor.id)
      .select("*")
      .single();

    if (themeError) {
      // إذا فشل الحفظ نرجع للثيم السابق.
      setSiteTheme(
        previousTheme
      );
      setError(
        "تعذر تغيير الثيم: " +
          themeError.message
      );
      setMessage("");
    } else {
      setDoctor(data as Doctor);
      setMessage(
        `تم حفظ الثيم: ${
          theme === "black-gold"
            ? "Black & Gold"
            : theme === "clean-white"
            ? "Clean White"
            : "Dark Blue"
        }. افتح موقعك وشوف التغيير.`
      );
    }

    setThemeSaving(false);
  }

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

  const subscriptionDaysLeft =
    doctor?.subscription_expires_at
      ? Math.ceil(
          (
            new Date(
              doctor.subscription_expires_at
            ).getTime() -
            Date.now()
          ) /
            86_400_000
        )
      : null;

  const subscriptionNearExpiry =
    Boolean(
      subscriptionReallyActive &&
      subscriptionDaysLeft !== null &&
      subscriptionDaysLeft >= 0 &&
      subscriptionDaysLeft <= 7
    );

  const pendingReviewsCount =
    patientReviews.filter(
      (item) =>
        !item.is_approved
    ).length;

  const featuredUntilTime =
    doctor?.featured_until
      ? new Date(
          doctor.featured_until
        ).getTime()
      : 0;

  const featuredActive =
    doctor?.featured_active ===
      true &&
    featuredUntilTime >
      Date.now();

  const featuredDaysLeft =
    featuredActive
      ? Math.max(
          1,
          Math.ceil(
            (
              featuredUntilTime -
              Date.now()
            ) /
              86_400_000
          )
        )
      : 0;

  const dashboardNotifications = [
    ...(pendingReviewsCount > 0
      ? [
          {
            title:
              `${pendingReviewsCount} رأي جديد بانتظار المراجعة`,
            text:
              "راجع آراء المرضى وانشر المناسب منها.",
            tone:
              "review",
          },
        ]
      : []),
    ...(renewalPending
      ? [
          {
            title:
              "طلب التجديد قيد المراجعة",
            text:
              "الإدارة راح تمدد الاشتراك بعد الموافقة.",
            tone:
              "renewal",
          },
        ]
      : []),
    ...(subscriptionNearExpiry
      ? [
          {
            title:
              `باقي ${subscriptionDaysLeft} يوم على انتهاء الاشتراك`,
            text:
              "جدد قبل الانتهاء حتى يبقى موقعك فعال.",
            tone:
              "expiry",
          },
        ]
      : []),
  ];

  function requestFeaturedPlacement() {
    if (!doctor) {
      return;
    }

    const adminWhatsApp =
      "9647803447144";

    const text =
      `مرحباً ADAM DESIGN، أريد ${
        featuredActive
          ? "تمديد"
          : "تفعيل"
      } Featured Doctor لمدة 30 يوم.\n\n` +
      `الطبيب: د. ${doctor.full_name}\n` +
      `الباقة الحالية: ${(
        doctor.subscription_plan ||
        "basic"
      ).toUpperCase()}\n` +
      `السعر: 75,000 د.ع\n\n` +
      `أريد تفاصيل الدفع والتفعيل.`;

    window.open(
      `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
        text
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

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
    setCaseCategory("عام");
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
    setEditingCategory(
      item.category || "عام"
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
    setEditingCategory("عام");
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

  function addFaqItem() {
    const question =
      faqQuestion.trim();
    const answer =
      faqAnswer.trim();

    if (!question || !answer) {
      setError(
        "اكتب السؤال والجواب قبل الإضافة."
      );
      return;
    }

    if (faqItems.length >= 10) {
      setError(
        "الحد الأعلى 10 أسئلة شائعة."
      );
      return;
    }

    setFaqItems((old) => [
      ...old,
      {
        question,
        answer,
      },
    ]);

    setFaqQuestion("");
    setFaqAnswer("");
    setError("");
    setMessage(
      "تمت إضافة السؤال. اضغط حفظ المعلومات حتى ينحفظ بالموقع."
    );
  }

  function removeFaqItem(
    index: number
  ) {
    setFaqItems((old) =>
      old.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setMessage(
      "تم حذف السؤال من القائمة. اضغط حفظ المعلومات."
    );
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

  async function shareMyWebsite() {
    if (!doctor) return;

    const doctorPath =
      doctor.slug || doctor.id;

    const url =
      websiteUrl ||
      `${window.location.origin}/doctor/${doctorPath}`;

    const shareData = {
      title: `موقع د. ${doctor.full_name}`,
      text:
        "هذا رابط موقعي الطبي على ADAM DESIGN",
      url,
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        await navigator.share(
          shareData
        );
      } else {
        await navigator.clipboard.writeText(
          url
        );
        setMessage(
          "تم نسخ رابط موقعك للمشاركة."
        );
      }
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      setError(
        "تعذر فتح المشاركة."
      );
    }
  }

  function downloadQrCode() {
    if (!doctor) return;

    const wrapper =
      document.getElementById(
        "doctor-qr-code"
      );

    const svg =
      wrapper?.querySelector("svg");

    if (!svg) {
      setError(
        "تعذر تجهيز QR حالياً."
      );
      return;
    }

    const source =
      new XMLSerializer().serializeToString(
        svg
      );

    const blob =
      new Blob(
        [source],
        {
          type:
            "image/svg+xml;charset=utf-8",
        }
      );

    const objectUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = objectUrl;
    link.download =
      `doctor-${doctor.slug || doctor.id}-qr.svg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(
      objectUrl
    );

    setMessage(
      "تم تجهيز QR للحفظ."
    );
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
      <style>{`
        @media (max-width: 800px) {
          .themePickerGrid,
          .brandingGrid {
            grid-template-columns:
              1fr !important;
          }

          .premiumStatsGrid {
            grid-template-columns:
              repeat(2,minmax(0,1fr)) !important;
          }

          .premiumQrGrid,
          .premiumDeepAnalytics {
            grid-template-columns:
              1fr !important;
          }

          #doctor-qr-code {
            width: 190px !important;
            margin-inline: auto !important;
          }

          .mobileDashboardCasesScroller {
            display: grid !important;
            grid-auto-flow: column !important;
            grid-auto-columns: 86vw !important;
            grid-template-columns: none !important;
            gap: 14px !important;
            width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-inline: 0 !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-inline: contain;
            scrollbar-width: none;
            padding-bottom: 12px !important;
          }

          .mobileDashboardCasesScroller::-webkit-scrollbar {
            display: none;
          }

          .mobileDashboardCaseCard {
            width: 100% !important;
            min-width: 0 !important;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }
        }

        @media (max-width: 430px) {
          .mobileDashboardCasesScroller {
            grid-auto-columns: 88vw !important;
            gap: 12px !important;
          }
        }
      `}</style>

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

        <section
          style={{
            ...section,
            marginBottom: 18,
          }}
        >
          <small style={gold}>
            NOTIFICATIONS
          </small>

          <h2 style={sectionTitle}>
            إشعاراتك
          </h2>

          {dashboardNotifications.length === 0 ? (
            <div style={empty}>
              ماكو إشعارات جديدة حالياً.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {dashboardNotifications.map(
                (item) => (
                  <div
                    key={item.title}
                    style={{
                      padding: 14,
                      border:
                        item.tone === "expiry"
                          ? "1px solid rgba(255,184,77,.24)"
                          : item.tone === "review"
                          ? "1px solid rgba(50,186,255,.20)"
                          : "1px solid rgba(199,168,93,.20)",
                      background:
                        "rgba(255,255,255,.025)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#fff",
                      }}
                    >
                      {item.title}
                    </strong>

                    <p
                      style={{
                        ...muted,
                        margin:
                          "6px 0 0",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section
          style={{
            ...section,
            marginBottom: 18,
            border:
              featuredActive
                ? "1px solid rgba(255,191,105,.30)"
                : "1px solid rgba(255,191,105,.16)",
            background:
              "linear-gradient(145deg,rgba(255,191,105,.055),rgba(2,7,14,.96))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 18,
              alignItems:
                "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <small
                style={{
                  ...gold,
                  color: "#ffbf69",
                }}
              >
                FEATURED DOCTOR
              </small>

              <h2 style={sectionTitle}>
                ظهور مميز بالصفحة الرئيسية
              </h2>

              <p style={muted}>
                موقعك يظهر بأعلى قسم الأطباء مع شارة Featured
                وبطاقة مميزة. السعر 75,000 د.ع لمدة 30 يوم.
              </p>
            </div>

            <span
              style={{
                padding: "8px 10px",
                color:
                  featuredActive
                    ? "#160f05"
                    : "#ffbf69",
                background:
                  featuredActive
                    ? "#ffbf69"
                    : "rgba(255,191,105,.05)",
                border:
                  "1px solid rgba(255,191,105,.28)",
                fontSize: 9,
                fontWeight: 900,
              }}
            >
              {featuredActive
                ? "★ FEATURED ACTIVE"
                : "75,000 د.ع / 30 يوم"}
            </span>
          </div>

          {featuredActive &&
            doctor?.featured_until && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                color: "#ffbf69",
                border:
                  "1px solid rgba(255,191,105,.16)",
                background:
                  "rgba(255,191,105,.035)",
              }}
            >
              Featured فعال — باقي {featuredDaysLeft} يوم.
              ينتهي{" "}
              {new Date(
                doctor.featured_until
              ).toLocaleDateString(
                "ar-IQ"
              )}
            </div>
          )}

          <button
            type="button"
            style={{
              ...primary,
              marginTop: 14,
              background: "#ffbf69",
              color: "#160f05",
              border:
                "1px solid #ffbf69",
            }}
            onClick={
              requestFeaturedPlacement
            }
          >
            {featuredActive
              ? "طلب تمديد Featured"
              : "اطلب Featured هسه"}
          </button>
        </section>

        {subscriptionNearExpiry && (
          <section
            style={{
              ...section,
              padding: 18,
              marginBottom: 18,
              border:
                "1px solid rgba(255,184,77,.34)",
              background:
                "linear-gradient(135deg,rgba(255,184,77,.09),rgba(255,184,77,.025))",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#ffbf69",
                fontSize: 17,
              }}
            >
              باقي {subscriptionDaysLeft} يوم على انتهاء اشتراكك
            </strong>

            <p
              style={{
                ...muted,
                marginBottom: 12,
                lineHeight: 1.8,
              }}
            >
              معلوماتك وحالاتك تبقى محفوظة، بس موقعك يتوقف بعد الانتهاء إلى أن يتم التجديد.
            </p>

            {!renewalPending && (
              <button
                type="button"
                style={primary}
                onClick={() =>
                  setRenewalOpen(true)
                }
              >
                جدد اشتراكك هسه
              </button>
            )}
          </section>
        )}

        {currentPlan === "premium" ? (
          <section
            style={{
              ...section,
              background:
                "linear-gradient(145deg,rgba(8,18,32,.96),rgba(2,7,14,.98))",
              border:
                "1px solid rgba(50,186,255,.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 18,
                alignItems:
                  "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <small style={gold}>
                  PREMIUM TOOLS
                </small>

                <h2
                  style={{
                    ...sectionTitle,
                    marginBottom: 6,
                  }}
                >
                  أدوات موقعك
                </h2>

                <p style={muted}>
                  إحصائيات مبسطة + QR خاص بموقعك + مشاركة سريعة.
                </p>
              </div>

              <span style={quotaOk}>
                PREMIUM
              </span>
            </div>

            <div
              className="premiumStatsGrid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",
                gap: 12,
                marginTop: 20,
              }}
            >
              {[
                {
                  label:
                    "زيارات الموقع",
                  value:
                    stats.page_views,
                },
                {
                  label:
                    "ضغطات WhatsApp",
                  value:
                    stats.whatsapp_clicks,
                },
                {
                  label:
                    "آراء منشورة",
                  value:
                    patientReviews.filter(
                      (item) =>
                        item.is_approved
                    ).length,
                },
                {
                  label:
                    "حالات منشورة",
                  value:
                    publishedCasesCount,
                },
                {
                  label:
                    "طلبات مواعيد",
                  value:
                    stats.appointment_requests,
                },
                {
                  label:
                    "مشاركات الموقع",
                  value:
                    stats.profile_shares,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: 16,
                    background:
                      "rgba(255,255,255,.025)",
                    border:
                      "1px solid rgba(255,255,255,.07)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: 28,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 8,
                      color:
                        "rgba(255,255,255,.42)",
                      fontSize: 10,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="premiumDeepAnalytics"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 12,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  padding: 16,
                  background:
                    "rgba(255,255,255,.025)",
                  border:
                    "1px solid rgba(255,255,255,.07)",
                }}
              >
                <strong
                  style={{
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  أكثر الأقسام تفاعلاً
                </strong>

                {sectionStats.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {sectionStats
                      .slice(0, 5)
                      .map(
                        (item) => (
                          <div
                            key={
                              item.section_key
                            }
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: 10,
                              color:
                                "rgba(255,255,255,.62)",
                              fontSize: 10,
                            }}
                          >
                            <span>
                              {item.section_key}
                            </span>
                            <strong
                              style={{
                                color:
                                  "#32baff",
                              }}
                            >
                              {item.click_count}
                            </strong>
                          </div>
                        )
                      )}
                  </div>
                ) : (
                  <p style={muted}>
                    بعد ما الزوار يتفاعلون ويا أقسام الموقع راح تظهر النتائج هنا.
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: 16,
                  background:
                    "rgba(255,255,255,.025)",
                  border:
                    "1px solid rgba(255,255,255,.07)",
                }}
              >
                <strong
                  style={{
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  أكثر الخدمات المطلوبة
                </strong>

                {serviceStats.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {serviceStats
                      .slice(0, 5)
                      .map(
                        (item) => (
                          <div
                            key={
                              item.service_name
                            }
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: 10,
                              color:
                                "rgba(255,255,255,.62)",
                              fontSize: 10,
                            }}
                          >
                            <span>
                              {item.service_name}
                            </span>
                            <strong
                              style={{
                                color:
                                  "#c7a85d",
                              }}
                            >
                              {item.click_count}
                            </strong>
                          </div>
                        )
                      )}
                  </div>
                ) : (
                  <p style={muted}>
                    ضغطات الزوار على الخدمات راح تظهر هنا.
                  </p>
                )}
              </div>
            </div>

            <div
              className="premiumQrGrid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "220px minmax(0,1fr)",
                gap: 18,
                marginTop: 18,
                alignItems: "center",
              }}
            >
              <div
                id="doctor-qr-code"
                style={{
                  width: 220,
                  padding: 14,
                  background: "#fff",
                  boxSizing:
                    "border-box",
                }}
              >
                {websiteUrl && (
                  <QRCode
                    value={websiteUrl}
                    size={192}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                )}
              </div>

              <div>
                <strong
                  style={{
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  QR خاص بموقعك
                </strong>

                <p
                  style={{
                    ...muted,
                    lineHeight: 1.9,
                    wordBreak:
                      "break-all",
                  }}
                >
                  {websiteUrl ||
                    "جاري تجهيز رابط الموقع..."}
                </p>

                <p style={muted}>
                  تقدر تحفظه وتحطه بالعيادة، الكارت، الإنستغرام أو أي مطبوعات.
                </p>

                <div style={actions}>
                  <button
                    type="button"
                    style={secondary}
                    onClick={
                      copyMyWebsite
                    }
                  >
                    نسخ الرابط
                  </button>

                  <button
                    type="button"
                    style={secondary}
                    onClick={
                      shareMyWebsite
                    }
                  >
                    مشاركة الموقع
                  </button>

                  <button
                    type="button"
                    style={primary}
                    onClick={
                      downloadQrCode
                    }
                  >
                    حفظ QR
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section
            style={{
              ...section,
              border:
                "1px solid rgba(199,168,93,.15)",
              background:
                "rgba(199,168,93,.025)",
            }}
          >
            <small style={gold}>
              PREMIUM TOOLS
            </small>

            <h2 style={sectionTitle}>
              QR وإحصائيات الموقع
            </h2>

            <p style={muted}>
              بالباقة المميزة تحصل على QR خاص بموقعك وإحصائيات زيارات وضغطات WhatsApp.
            </p>
          </section>
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
                تخصيص موقع الطبيب
              </h3>

              <p style={muted}>
                أضف موقع العيادة، أوقات الدوام وروابط السوشيال. تغيير الثيم متاح للباقة المميزة.
              </p>

              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  border:
                    "1px solid rgba(199,168,93,.16)",
                  background:
                    "rgba(199,168,93,.025)",
                }}
              >
                <strong>
                  تصميم الموقع
                </strong>

                {currentPlan === "premium" ? (
                  <>
                    <p style={muted}>
                      اختر الشكل الذي يناسب هوية عيادتك.
                    </p>

                    <div
                      className="themePickerGrid"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3,minmax(0,1fr))",
                        gap: 10,
                      }}
                    >
                      {[
                        {
                          id: "dark-blue" as SiteTheme,
                          title: "Dark Blue",
                          subtitle: "أزرق طبي عصري",
                          background:
                            "linear-gradient(135deg,#071522,#02070e)",
                          accent: "#32baff",
                          text: "#ffffff",
                        },
                        {
                          id: "black-gold" as SiteTheme,
                          title: "Black & Gold",
                          subtitle: "أسود وذهبي فاخر",
                          background:
                            "linear-gradient(135deg,#17120a,#030303)",
                          accent: "#d6b45e",
                          text: "#ffffff",
                        },
                        {
                          id: "clean-white" as SiteTheme,
                          title: "Clean White",
                          subtitle: "أبيض طبي نظيف",
                          background:
                            "linear-gradient(135deg,#ffffff,#e9eef3)",
                          accent: "#1677a7",
                          text: "#0c1720",
                        },
                      ].map((theme) => {
                        const selected =
                          siteTheme ===
                          theme.id;

                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() =>
                              changeSiteTheme(
                                theme.id
                              )
                            }
                            disabled={
                              themeSaving
                            }
                            style={{
                              minHeight: 112,
                              padding: 14,
                              textAlign: "right",
                              cursor:
                                themeSaving
                                  ? "wait"
                                  : "pointer",
                              opacity:
                                themeSaving &&
                                !selected
                                  ? 0.62
                                  : 1,
                              color:
                                theme.text,
                              background:
                                theme.background,
                              border:
                                selected
                                  ? `2px solid ${theme.accent}`
                                  : "1px solid rgba(255,255,255,.12)",
                              boxShadow:
                                selected
                                  ? `0 0 0 4px ${theme.accent}35, 0 14px 36px rgba(0,0,0,.25)`
                                  : "none",
                              transform:
                                selected
                                  ? "translateY(-2px)"
                                  : "none",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                width: 24,
                                height: 3,
                                marginBottom: 24,
                                background:
                                  theme.accent,
                              }}
                            />

                            <strong
                              style={{
                                display: "block",
                              }}
                            >
                              {theme.title}
                            </strong>

                            <small
                              style={{
                                display: "block",
                                marginTop: 6,
                                opacity: 0.66,
                              }}
                            >
                              {theme.subtitle}
                            </small>

                            {selected && (
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  marginTop: 10,
                                  padding:
                                    "4px 7px",
                                  color:
                                    theme.accent,
                                  border:
                                    `1px solid ${theme.accent}55`,
                                  fontSize: 8,
                                  letterSpacing:
                                    ".08em",
                                }}
                              >
                                {themeSaving
                                  ? "جاري الحفظ..."
                                  : "الثيم الحالي"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        padding: 14,
                        color:
                          siteTheme ===
                          "clean-white"
                            ? "#0c1720"
                            : "#fff",
                        background:
                          siteTheme ===
                          "black-gold"
                            ? "linear-gradient(135deg,#17120a,#030303)"
                            : siteTheme ===
                              "clean-white"
                            ? "linear-gradient(135deg,#ffffff,#e9eef3)"
                            : "linear-gradient(135deg,#071522,#02070e)",
                        border:
                          siteTheme ===
                          "black-gold"
                            ? "1px solid rgba(214,180,94,.32)"
                            : siteTheme ===
                              "clean-white"
                            ? "1px solid rgba(22,119,167,.20)"
                            : "1px solid rgba(50,186,255,.28)",
                      }}
                    >
                      <small
                        style={{
                          opacity: 0.55,
                        }}
                      >
                        PREVIEW
                      </small>

                      <strong
                        style={{
                          display: "block",
                          marginTop: 8,
                          fontSize: 17,
                        }}
                      >
                        {fullName ||
                          "اسم الطبيب"}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          opacity: 0.62,
                          fontSize: 10,
                        }}
                      >
                        {specialty ||
                          "الاختصاص"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p
                    style={{
                      ...muted,
                      marginBottom: 0,
                    }}
                  >
                    الباقة العادية تستخدم Dark Blue. خيارات Black & Gold وClean White متاحة للمميز.
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  border:
                    "1px solid rgba(50,186,255,.14)",
                  background:
                    "rgba(0,10,20,.24)",
                }}
              >
                <strong>
                  العيادة والدوام
                </strong>

                <div
                  style={{
                    ...grid,
                    marginTop: 14,
                  }}
                >
                  <Field
                    label="رابط Google Maps"
                    value={googleMapsUrl}
                    onChange={
                      setGoogleMapsUrl
                    }
                    placeholder="https://maps.app.goo.gl/..."
                  />

                  <Field
                    label="أيام الدوام"
                    value={clinicDays}
                    onChange={
                      setClinicDays
                    }
                    placeholder="مثال: السبت - الخميس"
                  />

                  <Field
                    label="من الساعة"
                    value={clinicHoursFrom}
                    onChange={
                      setClinicHoursFrom
                    }
                    type="time"
                  />

                  <Field
                    label="إلى الساعة"
                    value={clinicHoursTo}
                    onChange={
                      setClinicHoursTo
                    }
                    type="time"
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  background:
                    "rgba(0,0,0,.16)",
                }}
              >
                <strong>
                  روابط السوشيال
                </strong>

                <p style={muted}>
                  الصق الرابط الكامل لحسابك حتى يظهر للمرضى.
                </p>

                <div style={grid}>
                  <Field
                    label="Instagram"
                    value={instagramUrl}
                    onChange={
                      setInstagramUrl
                    }
                    placeholder="https://instagram.com/..."
                  />

                  <Field
                    label="TikTok"
                    value={tiktokUrl}
                    onChange={
                      setTiktokUrl
                    }
                    placeholder="https://tiktok.com/@..."
                  />

                  <Field
                    label="Facebook"
                    value={facebookUrl}
                    onChange={
                      setFacebookUrl
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>

            <div style={uploadSection}>
              <h3 style={subTitle}>
                هوية العيادة
              </h3>

              <p style={muted}>
                أضف Logo خاص للعيادة وصورة Cover حتى يصير رأس الصفحة أقوى.
              </p>

              <div
                className="brandingGrid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(0,1fr))",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    background:
                      "rgba(255,255,255,.02)",
                  }}
                >
                  <strong>
                    Logo العيادة
                  </strong>

                  <label
                    style={{
                      ...uploadButton,
                      display:
                        "inline-block",
                      marginTop: 10,
                    }}
                  >
                    {uploading
                      ? "جاري الرفع..."
                      : "اختيار Logo"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        chooseBrandingImage(
                          event,
                          "logo"
                        )
                      }
                      disabled={uploading}
                      hidden
                    />
                  </label>

                  {clinicLogo && (
                    <div
                      style={{
                        marginTop: 12,
                      }}
                    >
                      <img
                        src={clinicLogo}
                        alt="شعار العيادة"
                        style={{
                          width: 110,
                          height: 110,
                          objectFit:
                            "contain",
                          background:
                            "#05080d",
                          border:
                            "1px solid rgba(255,255,255,.08)",
                        }}
                      />

                      <button
                        type="button"
                        style={{
                          ...smallDanger,
                          display: "block",
                          marginTop: 8,
                        }}
                        onClick={() =>
                          setClinicLogo(
                            null
                          )
                        }
                      >
                        حذف الشعار
                      </button>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: 14,
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    background:
                      "rgba(255,255,255,.02)",
                  }}
                >
                  <strong>
                    Cover الصفحة
                  </strong>

                  <label
                    style={{
                      ...uploadButton,
                      display:
                        "inline-block",
                      marginTop: 10,
                    }}
                  >
                    {uploading
                      ? "جاري الرفع..."
                      : "اختيار Cover"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        chooseBrandingImage(
                          event,
                          "cover"
                        )
                      }
                      disabled={uploading}
                      hidden
                    />
                  </label>

                  {coverImage && (
                    <div
                      style={{
                        marginTop: 12,
                      }}
                    >
                      <img
                        src={coverImage}
                        alt="Cover العيادة"
                        style={{
                          width: "100%",
                          height: 130,
                          objectFit:
                            "cover",
                          border:
                            "1px solid rgba(255,255,255,.08)",
                        }}
                      />

                      <button
                        type="button"
                        style={{
                          ...smallDanger,
                          marginTop: 8,
                        }}
                        onClick={() =>
                          setCoverImage(
                            null
                          )
                        }
                      >
                        حذف الـCover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={uploadSection}>
              <h3 style={subTitle}>
                عروض مؤقتة
              </h3>

              <p style={muted}>
                أضف عرض أو خصم وحدد تاريخ الانتهاء. العرض يختفي تلقائياً بعد التاريخ.
              </p>

              <div style={grid}>
                <Field
                  label="عنوان العرض"
                  value={offerTitle}
                  onChange={
                    setOfferTitle
                  }
                  placeholder="مثال: خصم 20% على التبييض"
                />

                <Field
                  label="تاريخ الانتهاء"
                  value={offerExpiresAt}
                  onChange={
                    setOfferExpiresAt
                  }
                  type="date"
                />
              </div>

              <label style={label}>
                تفاصيل العرض
              </label>

              <textarea
                value={offerDescription}
                onChange={(event) =>
                  setOfferDescription(
                    event.target.value
                  )
                }
                rows={3}
                maxLength={350}
                style={textarea}
                placeholder="اكتب تفاصيل قصيرة وواضحة..."
              />

              <button
                type="button"
                style={secondary}
                onClick={addOffer}
              >
                إضافة العرض
              </button>

              {offers.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  {offers.map(
                    (offer) => (
                      <div
                        key={offer.id}
                        style={{
                          padding: 14,
                          border:
                            "1px solid rgba(255,184,77,.18)",
                          background:
                            "rgba(255,184,77,.035)",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            color: "#ffbf69",
                          }}
                        >
                          {offer.title}
                        </strong>

                        {offer.description && (
                          <p style={muted}>
                            {offer.description}
                          </p>
                        )}

                        <small
                          style={{
                            display: "block",
                            color:
                              "rgba(255,255,255,.38)",
                            marginBottom: 10,
                          }}
                        >
                          ينتهي: {new Date(
                            offer.expires_at
                          ).toLocaleDateString(
                            "ar-IQ"
                          )}
                        </small>

                        <button
                          type="button"
                          style={smallDanger}
                          onClick={() =>
                            removeOffer(
                              offer.id
                            )
                          }
                        >
                          حذف العرض
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div style={uploadSection}>
              <h3 style={subTitle}>
                الأسئلة الشائعة FAQ
              </h3>

              <p style={muted}>
                أضف أجوبة للأسئلة اللي غالباً يسألها المرضى. الحد الأعلى 10 أسئلة.
              </p>

              <div style={grid}>
                <Field
                  label="السؤال"
                  value={faqQuestion}
                  onChange={setFaqQuestion}
                  placeholder="مثال: هل الحجز مسبق؟"
                />

                <div>
                  <label style={label}>
                    الجواب
                  </label>

                  <textarea
                    value={faqAnswer}
                    onChange={(event) =>
                      setFaqAnswer(
                        event.target.value
                      )
                    }
                    rows={3}
                    maxLength={500}
                    style={textarea}
                    placeholder="اكتب جواب مختصر وواضح..."
                  />
                </div>
              </div>

              <button
                type="button"
                style={secondary}
                onClick={addFaqItem}
                disabled={faqItems.length >= 10}
              >
                إضافة سؤال
              </button>

              {faqItems.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  {faqItems.map(
                    (item, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        style={{
                          padding: 14,
                          border:
                            "1px solid rgba(255,255,255,.08)",
                          background:
                            "rgba(255,255,255,.02)",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            color: "#fff",
                            fontSize: 12,
                          }}
                        >
                          {item.question}
                        </strong>

                        <p
                          style={{
                            ...muted,
                            margin: "7px 0 10px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {item.answer}
                        </p>

                        <button
                          type="button"
                          style={smallDanger}
                          onClick={() =>
                            removeFaqItem(index)
                          }
                        >
                          حذف السؤال
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

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

            <div style={uploadSection}>
              <h3 style={subTitle}>
                خدمات الطبيب
              </h3>

              {currentPlan === "premium" ? (
                <>
                  <p style={muted}>
                    أضف خدماتك حتى تظهر داخل موقعك ككروت احترافية.
                  </p>

                  <div
                    style={{
                      marginTop: 18,
                      padding: 16,
                      border:
                        "1px solid rgba(0,140,255,.18)",
                      background:
                        "rgba(0,10,20,.28)",
                    }}
                  >
                    <p style={muted}>
                      مثال: زراعة الأسنان، ابتسامة هوليود، تبييض، تقويم.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        value={newService}
                        onChange={(e) =>
                          setNewService(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addService();
                          }
                        }}
                        placeholder="اكتب اسم الخدمة"
                        style={{
                          ...input,
                          flex: "1 1 240px",
                        }}
                      />

                      <button
                        type="button"
                        style={secondary}
                        onClick={addService}
                      >
                        إضافة الخدمة
                      </button>
                    </div>

                    {services.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 14,
                        }}
                      >
                        {services.map(
                          (service, index) => (
                            <div
                              key={`${service}-${index}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding:
                                  "9px 11px",
                                border:
                                  "1px solid rgba(50,186,255,.25)",
                                background:
                                  "rgba(50,186,255,.06)",
                              }}
                            >
                              <span>
                                {service}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeService(
                                    index
                                  )
                                }
                                style={{
                                  border: 0,
                                  background:
                                    "transparent",
                                  color:
                                    "#ff9b9b",
                                  cursor:
                                    "pointer",
                                  fontSize: 16,
                                }}
                                aria-label={`حذف ${service}`}
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: 16,
                    border:
                      "1px solid rgba(199,168,93,.18)",
                    background:
                      "rgba(199,168,93,.04)",
                  }}
                >
                  <strong>
                    متاحة للباقة المميزة
                  </strong>
                  <p
                    style={{
                      ...muted,
                      marginBottom: 0,
                    }}
                  >
                    عرض خدمات الطبيب داخل الموقع متاح للباقة المميزة.
                  </p>
                </div>
              )}
            </div>

            <div style={uploadSection}>
              <h3 style={subTitle}>
                آراء المرضى الواردة
              </h3>

              {currentPlan === "premium" ? (
                <>
                  <p style={muted}>
                    المريض يكتب رأيه من موقعك. الرأي لا يظهر للناس إلا بعد موافقتك.
                    تقدر تنشره، تخفيه أو تحذفه.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 12,
                      marginBottom: 16,
                    }}
                  >
                    <span style={quotaOk}>
                      منشور {
                        patientReviews.filter(
                          (item) =>
                            item.is_approved
                        ).length
                      } / 20
                    </span>

                    <span style={quotaFull}>
                      بانتظار الموافقة {
                        patientReviews.filter(
                          (item) =>
                            !item.is_approved
                        ).length
                      }
                    </span>
                  </div>

                  {patientReviews.length ===
                  0 ? (
                    <div style={empty}>
                      لا توجد آراء مرسلة من المرضى حالياً.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      {patientReviews.map(
                        (review) => (
                          <article
                            key={review.id}
                            style={{
                              padding: 16,
                              border:
                                review.is_approved
                                  ? "1px solid rgba(37,211,102,.2)"
                                  : "1px solid rgba(199,168,93,.22)",
                              background:
                                "rgba(0,0,0,.22)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                gap: 12,
                                alignItems:
                                  "flex-start",
                                flexWrap:
                                  "wrap",
                              }}
                            >
                              <div>
                                <strong>
                                  {
                                    review.patient_name
                                  }
                                </strong>

                                <div
                                  style={{
                                    color:
                                      "#f2ca64",
                                    marginTop: 6,
                                    letterSpacing:
                                      ".08em",
                                  }}
                                >
                                  {"★".repeat(
                                    review.rating
                                  )}
                                  <span
                                    style={{
                                      opacity:
                                        0.25,
                                    }}
                                  >
                                    {"★".repeat(
                                      5 -
                                        review.rating
                                    )}
                                  </span>
                                </div>
                              </div>

                              <span
                                style={
                                  review.is_approved
                                    ? quotaOk
                                    : quotaFull
                                }
                              >
                                {review.is_approved
                                  ? "منشور"
                                  : "بانتظار الموافقة"}
                              </span>
                            </div>

                            <p
                              style={{
                                ...muted,
                                margin:
                                  "12px 0",
                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {
                                review.review_text
                              }
                            </p>

                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap:
                                  "wrap",
                              }}
                            >
                              <button
                                type="button"
                                disabled={
                                  reviewSavingId ===
                                  review.id
                                }
                                style={
                                  review.is_approved
                                    ? secondary
                                    : primary
                                }
                                onClick={() =>
                                  approvePatientReview(
                                    review
                                  )
                                }
                              >
                                {reviewSavingId ===
                                review.id
                                  ? "جاري..."
                                  : review.is_approved
                                  ? "إخفاء الرأي"
                                  : "نشر الرأي"}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  reviewSavingId ===
                                  review.id
                                }
                                style={{
                                  ...smallDanger,
                                  width:
                                    "auto",
                                  marginTop:
                                    0,
                                }}
                                onClick={() =>
                                  deletePatientReview(
                                    review.id
                                  )
                                }
                              >
                                حذف
                              </button>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    padding: 16,
                    border:
                      "1px solid rgba(199,168,93,.18)",
                    background:
                      "rgba(199,168,93,.04)",
                  }}
                >
                  <strong>
                    متاحة للباقة المميزة
                  </strong>
                  <p
                    style={{
                      ...muted,
                      marginBottom: 0,
                    }}
                  >
                    استقبال آراء المرضى ونشرها داخل الموقع متاح للباقة المميزة.
                  </p>
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

            <Field
              label="تصنيف الحالة"
              value={caseCategory}
              onChange={setCaseCategory}
              placeholder="مثال: زراعة، تقويم، تجميل، تبييض"
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
            <div
              style={casesGrid}
              className="mobileDashboardCasesScroller"
            >
              {cases.map((item) => (
                <article
                  key={item.id}
                  style={caseCard}
                  className="mobileDashboardCaseCard"
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

                      <Field
                        label="تصنيف الحالة"
                        value={editingCategory}
                        onChange={setEditingCategory}
                        placeholder="مثال: زراعة، تقويم، تجميل"
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

                        {item.category && (
                          <span
                            style={{
                              display: "inline-block",
                              marginBottom: 9,
                              padding: "5px 8px",
                              color: "#32baff",
                              border:
                                "1px solid rgba(50,186,255,.18)",
                              fontSize: 9,
                            }}
                          >
                            {item.category}
                          </span>
                        )}

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
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
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
