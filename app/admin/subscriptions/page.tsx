"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "pending" | "approved" | "rejected";

type Plan =
  | "basic"
  | "professional"
  | "premium";

type PaymentMethod =
  | "kcard"
  | "zaincash";

type AdminDoctorSummary = {
  id: string;
  full_name: string | null;
  slug: string | null;
  specialty: string | null;
  profile_image: string | null;
  subscription_plan: string | null;
  subscription_active: boolean | null;
  subscription_expires_at: string | null;
  is_approved: boolean | null;
  featured_active: boolean | null;
  featured_started_at: string | null;
  featured_until: string | null;
};

type FeaturedSale = {
  id: string;
  doctor_id: string;
  amount_iqd: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
};

type SubscriptionRequest = {
  id: string;
  doctor_id: string | null;
  plan: Plan;
  duration_days: number;
  payment_method: PaymentMethod;
  transfer_number: string;
  receipt_url: string | null;
  status: Status;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  phone: string | null;
  doctor_name: string | null;
  whatsapp_number: string | null;
  registration_token: string | null;
  registration_expires_at: string | null;
  registration_completed_at: string | null;
};

const planNames: Record<Plan, string> = {
  basic: "الباقة العادية",
  professional: "الباقة الاحترافية",
  premium: "الباقة المميزة",
};

const paymentNames: Record<
  PaymentMethod,
  string
> = {
  kcard: "كي كارد",
  zaincash: "زين كاش",
};

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<
    SubscriptionRequest[]
  >([]);

  const [doctorsSummary, setDoctorsSummary] =
    useState<AdminDoctorSummary[]>([]);
  const [featuredSales, setFeaturedSales] =
    useState<FeaturedSale[]>([]);
  const [featuredSavingId, setFeaturedSavingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] =
    useState<SubscriptionRequest | null>(null);

  const [adminNote, setAdminNote] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState<string | null>(null);

  const [currentEmail, setCurrentEmail] =
    useState<string | null>(null);

  const [loginEmail, setLoginEmail] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  async function isAdminUser(
    userId: string
  ) {
    const {
      data,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) {
      throw new Error(
        `تعذر التحقق من صلاحية الأدمن: ${adminError.message}`
      );
    }

    return Boolean(data);
  }

  /*
   * =====================================================
   * AUTH + LOAD REQUESTS
   * =====================================================
   */

  const loadRequests = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * أولاً نتأكد من وجود جلسة فعلية
         */
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(
            `خطأ في جلسة الدخول: ${sessionError.message}`
          );
        }

        const session =
          sessionData.session;

        if (!session?.user) {
          setCurrentUser(null);
          setCurrentEmail(null);
          setRequests([]);
          setDoctorsSummary([]);

          throw new Error(
            "لا توجد جلسة دخول. سجّل دخول حساب الأدمن أولاً."
          );
        }

        const user = session.user;

        const allowed =
          await isAdminUser(user.id);

        if (!allowed) {
          setCurrentUser(null);
          setCurrentEmail(null);
          setRequests([]);
          setDoctorsSummary([]);

          setError(
            "الحساب الحالي ليس حساب أدمن. سجّل دخول حساب الأدمن."
          );

          return;
        }

        setCurrentUser(user.id);
        setCurrentEmail(
          user.email || null
        );

        console.log(
          "ADMIN USER:",
          user.id
        );

        console.log(
          "ADMIN EMAIL:",
          user.email
        );

        /*
         * =================================================
         * تحميل الطلبات
         * =================================================
         *
         * مهم:
         * لا نضع أي فلتر على doctor_id.
         *
         * لأن عندك طلبات doctor_id = null
         * وهي موجودة فعلاً في قاعدة البيانات.
         */

        const {
          data,
          error: selectError,
        } = await supabase
          .from("subscription_requests")
          .select(`
            id,
            doctor_id,
            plan,
            duration_days,
            payment_method,
            transfer_number,
            receipt_url,
            status,
            admin_note,
            created_at,
            updated_at,
            approved_at,
            phone,
            doctor_name,
            whatsapp_number,
            registration_token,
            registration_expires_at,
            registration_completed_at
          `)
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (selectError) {
          console.error(
            "LOAD SUBSCRIPTION REQUESTS ERROR:",
            selectError
          );

          throw new Error(
            `فشل تحميل الطلبات: ${selectError.message}`
          );
        }

        console.log(
          "SUBSCRIPTION REQUESTS:",
          data
        );

        setRequests(
          (data ||
            []) as SubscriptionRequest[]
        );

        const {
          data: doctorsData,
          error: doctorsError,
        } = await supabase
          .from("doctors")
          .select(
            "id,full_name,slug,specialty,profile_image,subscription_plan,subscription_active,subscription_expires_at,is_approved,featured_active,featured_started_at,featured_until"
          )
          .order(
            "subscription_expires_at",
            {
              ascending: true,
            }
          );

        if (doctorsError) {
          console.error(
            "LOAD ADMIN DOCTORS SUMMARY:",
            doctorsError
          );
          setDoctorsSummary([]);
        } else {
          setDoctorsSummary(
            (doctorsData ||
              []) as AdminDoctorSummary[]
          );
        }

        const {
          data: featuredSalesData,
          error: featuredSalesError,
        } =
          await supabase
            .from("featured_sales")
            .select(
              "id,doctor_id,amount_iqd,starts_at,ends_at,created_at"
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        if (featuredSalesError) {
          console.error(
            "LOAD FEATURED SALES:",
            featuredSalesError
          );
          setFeaturedSales([]);
        } else {
          setFeaturedSales(
            (featuredSalesData ||
              []) as FeaturedSale[]
          );
        }
      } catch (err) {
        console.error(
          "LOAD REQUESTS ERROR:",
          err
        );

        setRequests([]);
        setDoctorsSummary([]);

        setError(
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء تحميل الطلبات."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * =====================================================
   * CHECK AUTH ON PAGE LOAD
   * =====================================================
   */

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      setCheckingAuth(true);

      try {
        const {
          data,
          error: authError,
        } =
          await supabase.auth.getSession();

        if (!mounted) return;

        if (authError) {
          setError(
            authError.message
          );
          setCurrentUser(null);
          setCurrentEmail(null);
          setRequests([]);
          return;
        }

        if (data.session?.user) {
          const allowed =
            await isAdminUser(
              data.session.user.id
            );

          if (!allowed) {
            await supabase.auth.signOut();

            setCurrentUser(null);
            setCurrentEmail(null);
            setRequests([]);

            setMessage(
              "تم تسجيل خروج حساب الطبيب. الآن سجّل دخول حساب الأدمن."
            );

            return;
          }

          setCurrentUser(
            data.session.user.id
          );

          setCurrentEmail(
            data.session.user.email ||
              null
          );

          await loadRequests();
        } else {
          setCurrentUser(null);
          setCurrentEmail(null);
          setRequests([]);
        }
      } catch (err) {
        console.error(
          "CHECK AUTH ERROR:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "تعذر التحقق من تسجيل الدخول."
          );
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
          setLoading(false);
        }
      }
    }

    checkAuth();

    /*
     * مراقبة تسجيل الدخول والخروج
     */
    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) return;

          console.log(
            "AUTH EVENT:",
            event
          );

          if (
            session?.user
          ) {
            const allowed =
              await isAdminUser(
                session.user.id
              );

            if (!allowed) {
              setCurrentUser(null);
              setCurrentEmail(null);
              setRequests([]);

              return;
            }

            setCurrentUser(
              session.user.id
            );

            setCurrentEmail(
              session.user.email ||
                null
            );

            if (
              event ===
                "SIGNED_IN" ||
              event ===
                "TOKEN_REFRESHED"
            ) {
              /*
               * ننتظر دورة قصيرة حتى تستقر
               * الجلسة قبل تنفيذ الاستعلام.
               */
              setTimeout(() => {
                if (mounted) {
                  loadRequests();
                }
              }, 100);
            }
          } else {
            setCurrentUser(null);
            setCurrentEmail(null);
            setRequests([]);
          }
        }
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, [loadRequests]);

  /*
   * =====================================================
   * LOGIN
   * =====================================================
   */

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoginLoading(true);
    setError("");
    setMessage("");

    try {
      if (
        !loginEmail.trim() ||
        !loginPassword
      ) {
        throw new Error(
          "اكتب البريد الإلكتروني وكلمة المرور."
        );
      }

      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              loginEmail.trim(),
            password:
              loginPassword,
          }
        );

      if (loginError) {
        throw new Error(
          loginError.message
        );
      }

      if (!data.session?.user) {
        throw new Error(
          "تمت محاولة تسجيل الدخول لكن لم يتم إنشاء جلسة."
        );
      }

      const allowed =
        await isAdminUser(
          data.session.user.id
        );

      if (!allowed) {
        await supabase.auth.signOut();

        setCurrentUser(null);
        setCurrentEmail(null);
        setRequests([]);

        throw new Error(
          "هذا الحساب ليس حساب أدمن. استخدم إيميل وكلمة سر الأدمن."
        );
      }

      setCurrentUser(
        data.session.user.id
      );

      setCurrentEmail(
        data.session.user.email ||
          null
      );

      setLoginPassword("");

      setMessage(
        "تم تسجيل الدخول بنجاح."
      );

      /*
       * تحميل الطلبات مباشرة
       */
      await loadRequests();
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "فشل تسجيل الدخول."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  async function handleLogout() {
    setError("");
    setMessage("");

    const {
      error: logoutError,
    } = await supabase.auth.signOut();

    if (logoutError) {
      setError(
        logoutError.message
      );
      return;
    }

    setCurrentUser(null);
    setCurrentEmail(null);
    setRequests([]);
    setSelectedRequest(null);

    setMessage(
      "تم تسجيل الخروج."
    );
  }

  function isRenewalRequest(
    request: SubscriptionRequest
  ) {
    return Boolean(request.doctor_id);
  }

  function requestKindLabel(
    request: SubscriptionRequest
  ) {
    return isRenewalRequest(request)
      ? "تجديد / ترقية"
      : "اشتراك جديد";
  }

  /*
   * =====================================================
   * APPROVE
   * =====================================================
   */

  async function approveRequest(
    request: SubscriptionRequest
  ) {
    const renewal =
      isRenewalRequest(request);

    const confirmed =
      window.confirm(
        renewal
          ? `هل تريد الموافقة على تجديد اشتراك ${
              request.doctor_name || "الطبيب"
            } لمدة ${request.duration_days} يوم؟`
          : `هل تريد الموافقة على طلب ${
              request.doctor_name || "الطبيب"
            }؟`
      );

    if (!confirmed) return;

    setProcessingId(request.id);
    setError("");
    setMessage("");

    try {
      if (renewal) {
        /*
         * طلب التجديد مرتبط أصلاً بحساب الطبيب.
         * الـ RPC يمدد الاشتراك ويحفظ الباقة الجديدة
         * ولا ينشئ registration_token جديداً.
         */
        const {
          data,
          error: rpcError,
        } = await supabase.rpc(
          "approve_subscription_renewal",
          {
            request_id: request.id,
            admin_note_text:
              adminNote.trim() || null,
          }
        );

        if (rpcError) {
          throw new Error(
            rpcError.message
          );
        }

        if (data !== true) {
          throw new Error(
            "لم تتم الموافقة على التجديد."
          );
        }

        setMessage(
          "تمت الموافقة على التجديد وتم تمديد اشتراك الطبيب بنجاح."
        );
      } else {
        /*
         * اشتراك جديد قبل إنشاء حساب الطبيب:
         * نوافق الطلب ونولد رابط التسجيل.
         */
        const {
          data,
          error: rpcError,
        } = await supabase.rpc(
          "approve_subscription_request",
          {
            request_id: request.id,
            admin_note_text:
              adminNote.trim() || null,
          }
        );

        if (rpcError) {
          throw new Error(
            rpcError.message
          );
        }

        if (data !== true) {
          throw new Error(
            "لم تتم الموافقة على الطلب."
          );
        }

        setMessage(
          "تمت الموافقة على الطلب وإنشاء رابط التسجيل."
        );
      }

      setSelectedRequest(null);
      setAdminNote("");
      await loadRequests();
    } catch (err) {
      console.error(
        "APPROVE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء الموافقة."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /*
   * =====================================================
   * REJECT
   * =====================================================
   */

  async function rejectRequest(
    request: SubscriptionRequest
  ) {
    const confirmed =
      window.confirm(
        `هل تريد رفض طلب ${
          request.doctor_name ||
          "الطبيب"
        }؟`
      );

    if (!confirmed) return;

    setProcessingId(
      request.id
    );

    setError("");
    setMessage("");

    try {
      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "reject_subscription_request",
        {
          request_id:
            request.id,

          admin_note_text:
            adminNote.trim() ||
            null,
        }
      );

      if (rpcError) {
        throw new Error(
          rpcError.message
        );
      }

      if (data !== true) {
        throw new Error(
          "لم يتم رفض الطلب."
        );
      }

      setMessage(
        "تم رفض الطلب بنجاح."
      );

      setSelectedRequest(
        null
      );

      setAdminNote("");

      await loadRequests();
    } catch (err) {
      console.error(
        "REJECT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء الرفض."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /*
   * =====================================================
   * OPEN REQUEST
   * =====================================================
   */

  function openRequest(
    request: SubscriptionRequest
  ) {
    setSelectedRequest(
      request
    );

    setAdminNote(
      request.admin_note || ""
    );

    setError("");
    setMessage("");
  }

  function closeRequest() {
    setSelectedRequest(
      null
    );

    setAdminNote("");
  }

  /*
   * =====================================================
   * REGISTRATION LINK + WHATSAPP
   * =====================================================
   */

  function buildRegistrationUrl(
    request: SubscriptionRequest
  ) {
    if (!request.registration_token) {
      return null;
    }

    return `${window.location.origin}/register/${request.registration_token}`;
  }

  function normalizeIraqiWhatsAppNumber(
    rawNumber: string
  ) {
    let phone =
      rawNumber.replace(/\D/g, "");

    if (phone.startsWith("00")) {
      phone = phone.substring(2);
    }

    if (phone.startsWith("0")) {
      phone =
        "964" + phone.substring(1);
    } else if (!phone.startsWith("964")) {
      phone =
        "964" + phone;
    }

    return phone;
  }

  function sendRegistrationWhatsApp(
    request: SubscriptionRequest
  ) {
    setError("");
    setMessage("");

    const rawPhone =
      request.whatsapp_number ||
      request.phone;

    if (!rawPhone) {
      setError(
        "لا يوجد رقم WhatsApp لهذا الطبيب."
      );
      return;
    }

    const registrationUrl =
      buildRegistrationUrl(request);

    if (!registrationUrl) {
      setError(
        "لا يوجد رابط تسجيل لهذا الطلب. حدّث الطلبات ثم حاول مرة أخرى."
      );
      return;
    }

    if (
      request.registration_expires_at &&
      new Date(
        request.registration_expires_at
      ).getTime() <= Date.now()
    ) {
      setError(
        "انتهت صلاحية رابط التسجيل لهذا الطلب."
      );
      return;
    }

    const phone =
      normalizeIraqiWhatsAppNumber(
        rawPhone
      );

    const doctorName =
      request.doctor_name
        ? `د. ${request.doctor_name}`
        : "دكتور";

    const loginUrl =
      `${window.location.origin}/doctor-login`;

    const text =
      `مرحباً ${doctorName} 🌷\n\n` +
      `تمت الموافقة على طلب اشتراكك في ADAM DESIGN ✅\n\n` +
      `هذا رابط التسجيل لأول مرة فقط:\n\n` +
      `${registrationUrl}\n\n` +
      `بعد إكمال التسجيل وحفظ حسابك، استخدم رابط دخول الطبيب التالي بأي وقت للرجوع إلى حسابك بواسطة الإيميل وكلمة السر:\n\n` +
      `${loginUrl}\n\n` +
      `بعد تسجيل الدخول ستتمكن من إدارة معلوماتك وخدماتك وحالاتك وصورك من لوحة الطبيب.\n\n` +
      `يرجى إكمال التسجيل قبل انتهاء صلاحية رابط التسجيل.`;

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        text
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openRegistrationLink(
    request: SubscriptionRequest
  ) {
    setError("");
    setMessage("");

    const registrationUrl =
      buildRegistrationUrl(request);

    if (!registrationUrl) {
      setError(
        "لا يوجد رابط تسجيل لهذا الطلب."
      );
      return;
    }

    window.open(
      registrationUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function changeFeaturedDoctor(
    doctor: AdminDoctorSummary,
    action:
      | "activate"
      | "disable"
  ) {
    const confirmed =
      window.confirm(
        action === "activate"
          ? `تفعيل/تمديد Featured للدكتور ${
              doctor.full_name ||
              "الطبيب"
            } لمدة 30 يوم مقابل 75,000 د.ع؟`
          : `إيقاف Featured للدكتور ${
              doctor.full_name ||
              "الطبيب"
            }؟`
      );

    if (!confirmed) return;

    setFeaturedSavingId(
      doctor.id
    );
    setError("");
    setMessage("");

    try {
      const {
        data,
        error: rpcError,
      } =
        await supabase.rpc(
          "set_doctor_featured",
          {
            p_doctor_id:
              doctor.id,
            p_action:
              action,
          }
        );

      if (rpcError) {
        throw new Error(
          rpcError.message
        );
      }

      if (data !== true) {
        throw new Error(
          "لم يتم تحديث حالة Featured."
        );
      }

      setMessage(
        action === "activate"
          ? "تم تفعيل/تمديد Featured لمدة 30 يوم وتسجيل 75,000 د.ع."
          : "تم إيقاف Featured."
      );

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحديث Featured."
      );
    } finally {
      setFeaturedSavingId(
        null
      );
    }
  }

  /*
   * =====================================================
   * FORMAT DATE
   * =====================================================
   */

  function formatDate(
    value: string
  ) {
    try {
      return new Date(
        value
      ).toLocaleString(
        "ar-IQ",
        {
          dateStyle:
            "medium",
          timeStyle:
            "short",
        }
      );
    } catch {
      return value;
    }
  }

  /*
   * =====================================================
   * STATUS
   * =====================================================
   */

  function statusLabel(
    status: Status
  ) {
    if (
      status ===
      "approved"
    ) {
      return "مقبول";
    }

    if (
      status ===
      "rejected"
    ) {
      return "مرفوض";
    }

    return "قيد المراجعة";
  }

  /*
   * =====================================================
   * STATS
   * =====================================================
   */

  const pendingCount =
    requests.filter(
      (item) =>
        item.status ===
        "pending"
    ).length;

  const approvedCount =
    requests.filter(
      (item) =>
        item.status ===
        "approved"
    ).length;

  const rejectedCount =
    requests.filter(
      (item) =>
        item.status ===
        "rejected"
    ).length;

  const nowTime =
    Date.now();

  const activeDoctors =
    doctorsSummary.filter(
      (doctor) => {
        const expiry =
          doctor.subscription_expires_at
            ? new Date(
                doctor.subscription_expires_at
              ).getTime()
            : 0;

        return (
          doctor.subscription_active ===
            true &&
          doctor.is_approved === true &&
          expiry > nowTime
        );
      }
    );

  const activePremiumCount =
    activeDoctors.filter(
      (doctor) =>
        (
          doctor.subscription_plan ||
          ""
        ).toLowerCase() ===
        "premium"
    ).length;

  const activeBasicCount =
    activeDoctors.filter(
      (doctor) =>
        (
          doctor.subscription_plan ||
          "basic"
        ).toLowerCase() !==
        "premium"
    ).length;

  const activeFeaturedDoctors =
    activeDoctors.filter(
      (doctor) => {
        const featuredUntil =
          doctor.featured_until
            ? new Date(
                doctor.featured_until
              ).getTime()
            : 0;

        return (
          doctor.featured_active ===
            true &&
          featuredUntil >
            nowTime
        );
      }
    );

  const featuredRevenue =
    featuredSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        Number(
          sale.amount_iqd ||
            0
        ),
      0
    );

  const expiringSoonDoctors =
    activeDoctors
      .filter((doctor) => {
        const expiry =
          doctor.subscription_expires_at
            ? new Date(
                doctor.subscription_expires_at
              ).getTime()
            : 0;

        const days =
          Math.ceil(
            (
              expiry -
              nowTime
            ) /
              86_400_000
          );

        return (
          days >= 0 &&
          days <= 7
        );
      })
      .sort((a, b) => {
        const aTime =
          a.subscription_expires_at
            ? new Date(
                a.subscription_expires_at
              ).getTime()
            : 0;
        const bTime =
          b.subscription_expires_at
            ? new Date(
                b.subscription_expires_at
              ).getTime()
            : 0;

        return aTime - bTime;
      });

  /*
   * =====================================================
   * AUTH CHECKING
   * =====================================================
   */

  if (checkingAuth) {
    return (
      <main
        dir="rtl"
        style={pageStyle}
      >
        <div
          style={loginContainer}
        >
          <div
            style={loginCard}
          >
            <div
              style={brandStyle}
            >
              ADAM DESIGN
            </div>

            <h1
              style={
                loginTitle
              }
            >
              التحقق من الدخول
            </h1>

            <p
              style={
                subtitleStyle
              }
            >
              جاري التحقق من جلسة الأدمن...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =====================================================
   * LOGIN SCREEN
   * =====================================================
   */

  if (!currentUser) {
    return (
      <main
        dir="rtl"
        style={pageStyle}
      >
        <div
          style={loginContainer}
        >
          <div
            style={loginCard}
          >
            <div
              style={brandStyle}
            >
              ADAM DESIGN
            </div>

            <h1
              style={
                loginTitle
              }
            >
              تسجيل دخول الأدمن
            </h1>

            <p
              style={
                subtitleStyle
              }
            >
              سجّل دخول حساب Supabase المرتبط
              بلوحة الإدارة.
            </p>

            {error && (
              <div
                style={
                  errorBox
                }
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={
                  successBox
                }
              >
                {message}
              </div>
            )}

            <form
              onSubmit={
                handleLogin
              }
            >
              <label
                style={
                  loginLabel
                }
              >
                البريد الإلكتروني
              </label>

              <input
                type="email"
                value={
                  loginEmail
                }
                onChange={(e) =>
                  setLoginEmail(
                    e.target.value
                  )
                }
                placeholder="admin@example.com"
                autoComplete="email"
                style={
                  loginInput
                }
              />

              <label
                style={
                  loginLabel
                }
              >
                كلمة المرور
              </label>

              <input
                type="password"
                value={
                  loginPassword
                }
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                autoComplete="current-password"
                style={
                  loginInput
                }
              />

              <button
                type="submit"
                disabled={
                  loginLoading
                }
                style={
                  loginButton
                }
              >
                {loginLoading
                  ? "جاري تسجيل الدخول..."
                  : "دخول لوحة الإدارة"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =====================================================
   * ADMIN PAGE
   * =====================================================
   */

  return (
    <main
      dir="rtl"
      style={pageStyle}
    >
      <div
        style={
          containerStyle
        }
      >
        <div style={topBackRow}>
          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            style={backHomeButton}
          >
            ← رجوع للرئيسية
          </button>
        </div>

        {/* HEADER */}

        <header
          style={headerStyle}
        >
          <div>
            <div
              style={
                brandStyle
              }
            >
              ADAM DESIGN
            </div>

            <h1
              style={
                titleStyle
              }
            >
              إدارة الاشتراكات
            </h1>

            <p
              style={
                subtitleStyle
              }
            >
              مراجعة طلبات الاشتراك ومعلومات الدفع.
            </p>

            <div
              style={
                loggedInBadge
              }
            >
              ● مسجل دخول:{" "}
              {currentEmail ||
                currentUser}
            </div>
          </div>

          <div
            style={
              headerActions
            }
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/analytics"
                )
              }
              style={{
                ...refreshButton,
                border:
                  "1px solid rgba(50,186,255,.26)",
                color:
                  "#8fdcff",
                background:
                  "rgba(50,186,255,.055)",
              }}
            >
              إحصائيات الزوار
            </button>

            <button
              type="button"
              onClick={
                loadRequests
              }
              disabled={
                loading
              }
              style={
                refreshButton
              }
            >
              {loading
                ? "جاري التحديث..."
                : "تحديث الطلبات"}
            </button>

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={
                logoutButton
              }
            >
              تسجيل خروج
            </button>
          </div>
        </header>

        {/* MESSAGES */}

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
            style={
              errorBox
            }
          >
            {error}
          </div>
        )}

        {/* STATS */}

        <section
          style={
            statsGrid
          }
        >
          <Stat
            title="كل الطلبات"
            value={
              requests.length
            }
          />

          <Stat
            title="قيد المراجعة"
            value={
              pendingCount
            }
          />

          <Stat
            title="مقبولة"
            value={
              approvedCount
            }
          />

          <Stat
            title="مرفوضة"
            value={
              rejectedCount
            }
          />
        </section>

        <section
          style={{
            ...panelStyle,
            marginBottom: 22,
          }}
        >
          <div
            style={
              panelHeader
            }
          >
            <div>
              <div
                style={
                  sectionLabel
                }
              >
                PLATFORM OVERVIEW
              </div>

              <h2
                style={
                  sectionTitle
                }
              >
                ملخص المنصة
              </h2>
            </div>

            <div
              style={
                countBadge
              }
            >
              {activeDoctors.length} مشترك فعال
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(160px,1fr))",
              gap: 12,
            }}
          >
            <Stat
              title="المشتركون الفعالون"
              value={
                activeDoctors.length
              }
            />

            <Stat
              title="Premium"
              value={
                activePremiumCount
              }
            />

            <Stat
              title="Basic"
              value={
                activeBasicCount
              }
            />

            <Stat
              title="ينتهون خلال 7 أيام"
              value={
                expiringSoonDoctors.length
              }
            />

            <Stat
              title="Featured فعال"
              value={
                activeFeaturedDoctors.length
              }
            />

            <Stat
              title="إيراد Featured"
              value={
                featuredRevenue
              }
            />

            <Stat
              title="طلبات معلقة"
              value={
                pendingCount
              }
            />
          </div>

          {expiringSoonDoctors.length >
            0 && (
            <div
              style={{
                marginTop: 18,
                padding: 16,
                border:
                  "1px solid rgba(255,184,77,.22)",
                background:
                  "rgba(255,184,77,.04)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: 10,
                  color: "#ffbf69",
                }}
              >
                اشتراكات قريبة من الانتهاء
              </strong>

              <div
                style={{
                  display: "grid",
                  gap: 8,
                }}
              >
                {expiringSoonDoctors.map(
                  (doctor) => {
                    const days =
                      doctor.subscription_expires_at
                        ? Math.max(
                            0,
                            Math.ceil(
                              (
                                new Date(
                                  doctor.subscription_expires_at
                                ).getTime() -
                                nowTime
                              ) /
                                86_400_000
                            )
                          )
                        : 0;

                    return (
                      <div
                        key={doctor.id}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          padding:
                            "10px 12px",
                          border:
                            "1px solid rgba(255,255,255,.06)",
                          background:
                            "rgba(255,255,255,.02)",
                        }}
                      >
                        <span>
                          {doctor.full_name ||
                            "طبيب"}
                        </span>

                        <strong
                          style={{
                            color:
                              days <= 2
                                ? "#ff8585"
                                : "#ffbf69",
                          }}
                        >
                          باقي {days} يوم
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </section>

        <section
          style={{
            ...panelStyle,
            marginBottom: 22,
            border:
              "1px solid rgba(255,191,105,.20)",
            background:
              "linear-gradient(145deg,rgba(255,191,105,.045),rgba(1,6,14,.82))",
          }}
        >
          <div style={panelHeader}>
            <div>
              <div style={sectionLabel}>
                FEATURED DOCTORS
              </div>

              <h2 style={sectionTitle}>
                إدارة الظهور المميز
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color:
                    "rgba(255,255,255,.42)",
                  fontSize: 10,
                  lineHeight: 1.8,
                }}
              >
                السعر: 75,000 د.ع لكل 30 يوم. التفعيل أو التمديد يسجل عملية بيع تلقائياً.
              </p>
            </div>

            <div
              style={{
                ...countBadge,
                color: "#ffbf69",
                border:
                  "1px solid rgba(255,191,105,.22)",
                background:
                  "rgba(255,191,105,.04)",
              }}
            >
              {activeFeaturedDoctors.length} Featured فعال
            </div>
          </div>

          {activeDoctors.length ===
          0 ? (
            <div
              style={{
                padding: 18,
                color:
                  "rgba(255,255,255,.4)",
                border:
                  "1px dashed rgba(255,255,255,.08)",
              }}
            >
              ماكو مشتركين فعالين حالياً.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(260px,1fr))",
                gap: 10,
              }}
            >
              {activeDoctors.map(
                (doctor) => {
                  const featuredUntil =
                    doctor.featured_until
                      ? new Date(
                          doctor.featured_until
                        ).getTime()
                      : 0;

                  const featuredNow =
                    doctor.featured_active ===
                      true &&
                    featuredUntil >
                      nowTime;

                  const featuredDays =
                    featuredNow
                      ? Math.max(
                          1,
                          Math.ceil(
                            (
                              featuredUntil -
                              nowTime
                            ) /
                              86_400_000
                          )
                        )
                      : 0;

                  return (
                    <article
                      key={doctor.id}
                      style={{
                        padding: 15,
                        border:
                          featuredNow
                            ? "1px solid rgba(255,191,105,.28)"
                            : "1px solid rgba(255,255,255,.07)",
                        background:
                          featuredNow
                            ? "rgba(255,191,105,.045)"
                            : "rgba(255,255,255,.02)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        {doctor.profile_image ? (
                          <img
                            src={doctor.profile_image}
                            alt={
                              doctor.full_name ||
                              "Doctor"
                            }
                            style={{
                              width: 52,
                              height: 52,
                              objectFit: "cover",
                              borderRadius: "50%",
                              border:
                                "1px solid rgba(255,255,255,.10)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "50%",
                              color:
                                "rgba(255,255,255,.35)",
                              border:
                                "1px solid rgba(255,255,255,.10)",
                            }}
                          >
                            DR
                          </div>
                        )}

                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "#fff",
                            }}
                          >
                            {doctor.full_name ||
                              "طبيب"}
                          </strong>

                          <small
                            style={{
                              display: "block",
                              marginTop: 4,
                              color:
                                "rgba(255,255,255,.38)",
                            }}
                          >
                            {(
                              doctor.subscription_plan ||
                              "basic"
                            ).toUpperCase()}
                          </small>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          padding: 10,
                          color:
                            featuredNow
                              ? "#ffbf69"
                              : "rgba(255,255,255,.42)",
                          border:
                            featuredNow
                              ? "1px solid rgba(255,191,105,.18)"
                              : "1px solid rgba(255,255,255,.06)",
                          background:
                            "rgba(0,0,0,.12)",
                          fontSize: 10,
                        }}
                      >
                        {featuredNow
                          ? `★ Featured — باقي ${featuredDays} يوم`
                          : "غير مفعّل"}
                      </div>

                      {featuredNow &&
                        doctor.featured_until && (
                        <small
                          style={{
                            display: "block",
                            marginTop: 8,
                            color:
                              "rgba(255,255,255,.34)",
                          }}
                        >
                          ينتهي:{" "}
                          {formatDate(
                            doctor.featured_until
                          )}
                        </small>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginTop: 12,
                        }}
                      >
                        <button
                          type="button"
                          disabled={
                            featuredSavingId ===
                            doctor.id
                          }
                          onClick={() =>
                            changeFeaturedDoctor(
                              doctor,
                              "activate"
                            )
                          }
                          style={{
                            padding: "10px 12px",
                            color: "#160f05",
                            background: "#ffbf69",
                            border:
                              "1px solid #ffbf69",
                            cursor:
                              featuredSavingId ===
                              doctor.id
                                ? "wait"
                                : "pointer",
                            fontWeight: 800,
                          }}
                        >
                          {featuredSavingId ===
                          doctor.id
                            ? "جاري..."
                            : featuredNow
                              ? "تمديد +30 يوم"
                              : "تفعيل 30 يوم"}
                        </button>

                        {featuredNow && (
                          <button
                            type="button"
                            disabled={
                              featuredSavingId ===
                              doctor.id
                            }
                            onClick={() =>
                              changeFeaturedDoctor(
                                doctor,
                                "disable"
                              )
                            }
                            style={{
                              padding: "10px 12px",
                              color: "#ff9b9b",
                              background:
                                "rgba(255,80,80,.04)",
                              border:
                                "1px solid rgba(255,100,100,.18)",
                              cursor: "pointer",
                            }}
                          >
                            إيقاف
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/doctor/${
                                doctor.slug ||
                                doctor.id
                              }`,
                              "_blank"
                            )
                          }
                          style={{
                            padding: "10px 12px",
                            color: "#fff",
                            background: "transparent",
                            border:
                              "1px solid rgba(255,255,255,.09)",
                            cursor: "pointer",
                          }}
                        >
                          عرض الموقع
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* CONTENT */}

        <section
          style={
            panelStyle
          }
        >
          <div
            style={
              panelHeader
            }
          >
            <div>
              <div
                style={
                  sectionLabel
                }
              >
                SUBSCRIPTION REQUESTS
              </div>

              <h2
                style={
                  sectionTitle
                }
              >
                طلبات الاشتراك
              </h2>
            </div>

            <div
              style={
                countBadge
              }
            >
              {requests.length} طلب
            </div>
          </div>

          {loading ? (
            <div
              style={
                emptyState
              }
            >
              جاري تحميل الطلبات...
            </div>
          ) : requests.length ===
            0 ? (
            <div
              style={
                emptyState
              }
            >
              <div
                style={
                  emptyTitle
                }
              >
                لا توجد طلبات ظاهرة
              </div>

              <div
                style={
                  emptyDescription
                }
              >
                إذا كنت متأكد أن هناك طلبات في
                قاعدة البيانات، تحقق من RLS
                الخاصة بجدول
                subscription_requests.
              </div>

              <button
                type="button"
                onClick={
                  loadRequests
                }
                style={
                  retryButton
                }
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div
              style={
                tableWrapper
              }
            >
              <table
                style={
                  tableStyle
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        thStyle
                      }
                    >
                      الطبيب
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      نوع الطلب
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      الباقة
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      الدفع
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      رقم الوصل
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      الحالة
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      التاريخ
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      الإجراء
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map(
                    (
                      request
                    ) => (
                      <tr
                        key={
                          request.id
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          <strong>
                            {request.doctor_name ||
                              "غير مسجل"}
                          </strong>

                          <small
                            style={
                              smallText
                            }
                          >
                            {request.whatsapp_number ||
                              request.phone ||
                              "لا يوجد رقم"}
                          </small>

                          {!request.doctor_id && (
                            <small
                              style={
                                warningText
                              }
                            >
                              طلب غير مرتبط بحساب
                            </small>
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={
                              isRenewalRequest(
                                request
                              )
                                ? renewalBadge
                                : newRequestBadge
                            }
                          >
                            {requestKindLabel(
                              request
                            )}
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {planNames[
                            request
                              .plan
                          ] ||
                            request.plan}

                          <small
                            style={
                              smallText
                            }
                          >
                            {
                              request.duration_days
                            }{" "}
                            يوم
                          </small>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {paymentNames[
                            request
                              .payment_method
                          ] ||
                            request.payment_method}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            request.transfer_number
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={statusStyle(
                              request.status
                            )}
                          >
                            {statusLabel(
                              request.status
                            )}
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {formatDate(
                            request.created_at
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              openRequest(
                                request
                              )
                            }
                            style={
                              viewButton
                            }
                          >
                            عرض الطلب
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {selectedRequest && (
        <div
          style={
            overlayStyle
          }
        >
          <div
            style={
              modalStyle
            }
          >
            <div
              style={
                modalHeaderStyle
              }
            >
              <div>
                <div
                  style={
                    sectionLabel
                  }
                >
                  REQUEST DETAILS
                </div>

                <h2
                  style={
                    modalTitleStyle
                  }
                >
                  تفاصيل الطلب
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeRequest
                }
                style={
                  closeButton
                }
              >
                ×
              </button>
            </div>

            <div
              style={
                detailsGrid
              }
            >
              <Detail
                label="رقم الطلب"
                value={
                  selectedRequest.id
                }
              />

              <Detail
                label="نوع الطلب"
                value={requestKindLabel(
                  selectedRequest
                )}
              />

              <Detail
                label="اسم الطبيب"
                value={
                  selectedRequest.doctor_name ||
                  "غير مسجل"
                }
              />

              <Detail
                label="WhatsApp"
                value={
                  selectedRequest.whatsapp_number ||
                  selectedRequest.phone ||
                  "غير مسجل"
                }
              />

              <Detail
                label="Doctor ID"
                value={
                  selectedRequest.doctor_id ||
                  "غير مرتبط"
                }
              />

              <Detail
                label="الباقة"
                value={
                  planNames[
                    selectedRequest
                      .plan
                  ] ||
                  selectedRequest.plan
                }
              />

              <Detail
                label="المدة"
                value={`${selectedRequest.duration_days} يوم`}
              />

              <Detail
                label="طريقة الدفع"
                value={
                  paymentNames[
                    selectedRequest
                      .payment_method
                  ] ||
                  selectedRequest
                    .payment_method
                }
              />

              <Detail
                label="رقم العملية"
                value={
                  selectedRequest.transfer_number
                }
              />

              <Detail
                label="الحالة"
                value={statusLabel(
                  selectedRequest.status
                )}
              />

              <Detail
                label="تاريخ الطلب"
                value={formatDate(
                  selectedRequest.created_at
                )}
              />
            </div>

            {/* RECEIPT */}

            <div
              style={
                receiptSection
              }
            >
              <div
                style={
                  receiptTitle
                }
              >
                صورة الوصل
              </div>

              {selectedRequest.receipt_url ? (
                <a
                  href={
                    selectedRequest.receipt_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={
                      selectedRequest.receipt_url
                    }
                    alt="وصل الدفع"
                    style={
                      receiptImageStyle
                    }
                  />
                </a>
              ) : (
                <div
                  style={
                    noReceiptStyle
                  }
                >
                  لا توجد صورة وصل.
                </div>
              )}
            </div>

            {/* NOTE */}

            <label
              style={
                labelStyle
              }
            >
              ملاحظة الإدارة
            </label>

            <textarea
              value={
                adminNote
              }
              onChange={(e) =>
                setAdminNote(
                  e.target.value
                )
              }
              placeholder="اكتب ملاحظة اختيارية..."
              style={
                textareaStyle
              }
              rows={4}
            />

            {/* PRE-REGISTRATION INFO */}

            {!selectedRequest.doctor_id &&
              selectedRequest.status ===
                "pending" && (
                <div
                  style={
                    warningBox
                  }
                >
                  <strong>
                    طلب تسجيل مسبق
                  </strong>

                  <br />

                  هذا الطلب غير مرتبط بحساب طبيب بعد،
                  وهذا طبيعي في نظام التسجيل المسبق.

                  <br />

                  يمكنك الموافقة عليه الآن، وسيتم
                  إنشاء رابط خاص لإكمال التسجيل لاحقاً.
                </div>
              )}

            {/* ACTIONS */}

            {selectedRequest.status ===
              "pending" && (
              <div
                style={
                  actionsStyle
                }
              >
                <button
                  type="button"
                  disabled={
                    processingId ===
                    selectedRequest.id
                  }
                  onClick={() =>
                    approveRequest(
                      selectedRequest
                    )
                  }
                  style={{
                    ...approveButton,
                    opacity:
                      processingId ===
                      selectedRequest.id
                        ? 0.6
                        : 1,
                  }}
                >
                  {processingId ===
                  selectedRequest.id
                    ? "جاري التنفيذ..."
                    : isRenewalRequest(
                          selectedRequest
                        )
                      ? "✓ الموافقة على التجديد"
                      : "✓ الموافقة على الطلب"}
                </button>

                <button
                  type="button"
                  disabled={
                    processingId ===
                    selectedRequest.id
                  }
                  onClick={() =>
                    rejectRequest(
                      selectedRequest
                    )
                  }
                  style={{
                    ...rejectButton,
                    opacity:
                      processingId ===
                      selectedRequest.id
                        ? 0.6
                        : 1,
                  }}
                >
                  رفض الطلب
                </button>
              </div>
            )}

            {selectedRequest.status ===
              "approved" && (
              <>
                <div
                  style={
                    approvedInfoBox
                  }
                >
                  <strong>
                    {isRenewalRequest(
                      selectedRequest
                    )
                      ? "تمت الموافقة على التجديد ✓"
                      : "تمت الموافقة على الطلب ✓"}
                  </strong>

                  <div
                    style={
                      approvedInfoText
                    }
                  >
                    {isRenewalRequest(
                      selectedRequest
                    )
                      ? "تم تمديد الاشتراك على حساب الطبيب مباشرة، ولا يحتاج إلى رابط تسجيل جديد."
                      : selectedRequest.registration_completed_at
                        ? "أكمل الطبيب التسجيل بهذا الرابط."
                        : selectedRequest.registration_token
                          ? "رابط التسجيل جاهز للإرسال إلى الطبيب."
                          : "تمت الموافقة، لكن رابط التسجيل غير ظاهر بعد. اضغط تحديث الطلبات."}
                  </div>

                  {selectedRequest.registration_expires_at &&
                    !selectedRequest.registration_completed_at && (
                      <div
                        style={
                          expiryText
                        }
                      >
                        صلاحية الرابط حتى:{" "}
                        {formatDate(
                          selectedRequest.registration_expires_at
                        )}
                      </div>
                    )}
                </div>

                {!isRenewalRequest(selectedRequest) &&
                  !selectedRequest.registration_completed_at &&
                  selectedRequest.registration_token && (
                    <div
                      style={
                        registrationActions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          sendRegistrationWhatsApp(
                            selectedRequest
                          )
                        }
                        style={
                          whatsappButton
                        }
                      >
                        إرسال رابط التسجيل عبر WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openRegistrationLink(
                            selectedRequest
                          )
                        }
                        style={
                          registrationLinkButton
                        }
                      >
                        فتح رابط التسجيل
                      </button>
                    </div>
                  )}
              </>
            )}

            {selectedRequest.status ===
              "rejected" && (
              <div
                style={
                  processedBox
                }
              >
                هذا الطلب مرفوض.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={
        statCard
      }
    >
      <span
        style={
          statTitle
        }
      >
        {title}
      </span>

      <strong
        style={
          statValue
        }
      >
        {value}
      </strong>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={
        detailCard
      }
    >
      <span
        style={
          detailLabel
        }
      >
        {label}
      </span>

      <strong
        style={
          detailValue
        }
      >
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 0%, rgba(0,140,255,.15), transparent 35%), #020409",
  color: "#fff",
  padding:
    "30px 16px 80px",
  fontFamily:
    "Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
};

const topBackRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  marginBottom: 14,
};

const backHomeButton: React.CSSProperties = {
  padding: "12px 20px",
  background: "rgba(255,255,255,.035)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,.14)",
  cursor: "pointer",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  paddingBottom: 25,
  marginBottom: 22,
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const brandStyle: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 11,
  letterSpacing: ".2em",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  fontFamily:
    "Georgia, serif",
  fontSize: 38,
  fontWeight: 400,
  margin: "8px 0",
};

const subtitleStyle: React.CSSProperties = {
  color:
    "rgba(255,255,255,.45)",
  fontSize: 12,
};

const loggedInBadge: React.CSSProperties = {
  marginTop: 10,
  color: "#65e0ac",
  fontSize: 11,
};

const refreshButton: React.CSSProperties = {
  padding: "12px 20px",
  background:
    "rgba(0,140,255,.1)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.35)",
  cursor: "pointer",
};

const logoutButton: React.CSSProperties = {
  padding: "12px 20px",
  background:
    "rgba(255,60,60,.08)",
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,60,60,.25)",
  cursor: "pointer",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 22,
};

const statCard: React.CSSProperties = {
  padding: 20,
  background:
    "rgba(3,8,18,.88)",
  border:
    "1px solid rgba(0,140,255,.15)",
};

const statTitle: React.CSSProperties = {
  display: "block",
  color:
    "rgba(255,255,255,.4)",
  fontSize: 11,
  marginBottom: 10,
};

const statValue: React.CSSProperties = {
  fontSize: 30,
  fontFamily:
    "Georgia, serif",
  color: "#32baff",
};

const panelStyle: React.CSSProperties = {
  background:
    "rgba(3,8,18,.9)",
  border:
    "1px solid rgba(0,140,255,.16)",
  padding: 25,
};

const panelHeader: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 15,
  marginBottom: 20,
};

const sectionLabel: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 9,
  letterSpacing: ".18em",
};

const sectionTitle: React.CSSProperties = {
  margin: "7px 0 0",
  fontFamily:
    "Georgia, serif",
  fontSize: 25,
  fontWeight: 400,
};

const countBadge: React.CSSProperties = {
  padding:
    "7px 12px",
  background:
    "rgba(0,140,255,.08)",
  color: "#32baff",
  fontSize: 11,
};

const tableWrapper: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse:
    "collapse",
  minWidth: 950,
};

const thStyle: React.CSSProperties = {
  textAlign: "right",
  padding:
    "14px 12px",
  borderBottom:
    "1px solid rgba(255,255,255,.1)",
  color: "#c7a85d",
  fontSize: 10,
  whiteSpace:
    "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding:
    "15px 12px",
  borderBottom:
    "1px solid rgba(255,255,255,.06)",
  color:
    "rgba(255,255,255,.75)",
  fontSize: 12,
  verticalAlign:
    "middle",
};

const smallText: React.CSSProperties = {
  display: "block",
  marginTop: 5,
  color:
    "rgba(255,255,255,.35)",
  fontSize: 10,
};

const warningText: React.CSSProperties = {
  display: "block",
  marginTop: 5,
  color: "#ffd477",
  fontSize: 10,
};

const renewalBadge: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  background: "rgba(120,90,255,.1)",
  color: "#b7a8ff",
  border: "1px solid rgba(120,90,255,.25)",
  fontSize: 10,
  whiteSpace: "nowrap",
};

const newRequestBadge: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  background: "rgba(0,140,255,.08)",
  color: "#32baff",
  border: "1px solid rgba(0,140,255,.22)",
  fontSize: 10,
  whiteSpace: "nowrap",
};

const viewButton: React.CSSProperties = {
  padding:
    "9px 14px",
  background:
    "rgba(0,140,255,.08)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.25)",
  cursor: "pointer",
};

function statusStyle(
  status: Status
): React.CSSProperties {
  if (
    status ===
    "approved"
  ) {
    return {
      display:
        "inline-block",
      padding:
        "6px 10px",
      background:
        "rgba(0,200,120,.1)",
      color: "#65e0ac",
      border:
        "1px solid rgba(0,200,120,.2)",
      fontSize: 10,
    };
  }

  if (
    status ===
    "rejected"
  ) {
    return {
      display:
        "inline-block",
      padding:
        "6px 10px",
      background:
        "rgba(255,60,60,.1)",
      color: "#ff9b9b",
      border:
        "1px solid rgba(255,60,60,.2)",
      fontSize: 10,
    };
  }

  return {
    display:
      "inline-block",
    padding:
      "6px 10px",
    background:
      "rgba(255,190,60,.1)",
    color: "#ffd477",
    border:
      "1px solid rgba(255,190,60,.2)",
    fontSize: 10,
  };
}

const emptyState: React.CSSProperties = {
  padding: 50,
  textAlign: "center",
  color:
    "rgba(255,255,255,.4)",
};

const emptyTitle: React.CSSProperties = {
  fontSize: 18,
  color: "#fff",
  marginBottom: 10,
};

const emptyDescription: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.8,
  maxWidth: 550,
  margin:
    "0 auto 20px",
};

const retryButton: React.CSSProperties = {
  padding:
    "10px 18px",
  background:
    "rgba(0,140,255,.1)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.3)",
  cursor: "pointer",
};

const successBox: React.CSSProperties = {
  padding: 14,
  marginBottom: 20,
  background:
    "rgba(0,180,255,.08)",
  border:
    "1px solid rgba(0,180,255,.25)",
  color: "#7dccff",
};

const errorBox: React.CSSProperties = {
  padding: 14,
  marginBottom: 20,
  background:
    "rgba(255,40,40,.08)",
  border:
    "1px solid rgba(255,70,70,.3)",
  color: "#ff9b9b",
};

const warningBox: React.CSSProperties = {
  marginTop: 20,
  padding: 15,
  background:
    "rgba(255,190,60,.08)",
  border:
    "1px solid rgba(255,190,60,.25)",
  color: "#ffd477",
  fontSize: 12,
  lineHeight: 1.9,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background:
    "rgba(0,0,0,.8)",
  display: "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 900,
  maxHeight: "92vh",
  overflowY: "auto",
  background:
    "#050a13",
  border:
    "1px solid rgba(0,140,255,.25)",
  padding: 25,
  boxSizing:
    "border-box",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "center",
  marginBottom: 22,
};

const modalTitleStyle: React.CSSProperties = {
  fontFamily:
    "Georgia, serif",
  fontSize: 27,
  fontWeight: 400,
  margin:
    "7px 0 0",
};

const closeButton: React.CSSProperties = {
  width: 38,
  height: 38,
  background:
    "transparent",
  color: "#fff",
  border:
    "1px solid rgba(255,255,255,.15)",
  fontSize: 25,
  cursor: "pointer",
};

const detailsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(210px,1fr))",
  gap: 10,
};

const detailCard: React.CSSProperties = {
  padding: 14,
  background:
    "rgba(0,0,0,.25)",
  border:
    "1px solid rgba(255,255,255,.06)",
};

const detailLabel: React.CSSProperties = {
  display: "block",
  color: "#c7a85d",
  fontSize: 9,
  marginBottom: 7,
};

const detailValue: React.CSSProperties = {
  color:
    "rgba(255,255,255,.8)",
  fontSize: 12,
  wordBreak:
    "break-word",
};

const receiptSection: React.CSSProperties = {
  marginTop: 22,
};

const receiptTitle: React.CSSProperties = {
  color: "#c7a85d",
  fontSize: 11,
  marginBottom: 10,
};

const receiptImageStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 650,
  maxHeight: 600,
  objectFit:
    "contain",
  display: "block",
  background: "#000",
  border:
    "1px solid rgba(255,255,255,.08)",
};

const noReceiptStyle: React.CSSProperties = {
  padding: 30,
  textAlign: "center",
  background:
    "rgba(0,0,0,.2)",
  color:
    "rgba(255,255,255,.4)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 22,
  marginBottom: 8,
  color: "#c7a85d",
  fontSize: 10,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  boxSizing:
    "border-box",
  padding: 13,
  background:
    "rgba(0,0,0,.35)",
  color: "#fff",
  border:
    "1px solid rgba(0,140,255,.2)",
  outline: "none",
  resize: "vertical",
  fontFamily:
    "Arial, sans-serif",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 22,
};

const approveButton: React.CSSProperties = {
  padding:
    "13px 22px",
  background:
    "#008cff",
  color: "#fff",
  border: 0,
  cursor: "pointer",
};

const rejectButton: React.CSSProperties = {
  padding:
    "13px 22px",
  background:
    "rgba(255,50,50,.1)",
  color: "#ff9b9b",
  border:
    "1px solid rgba(255,50,50,.3)",
  cursor: "pointer",
};

const processedBox: React.CSSProperties = {
  marginTop: 22,
  padding: 14,
  background:
    "rgba(255,255,255,.04)",
  color:
    "rgba(255,255,255,.5)",
};

const approvedInfoBox: React.CSSProperties = {
  marginTop: 22,
  padding: 16,
  background:
    "rgba(0,200,120,.07)",
  border:
    "1px solid rgba(0,200,120,.25)",
  color: "#65e0ac",
};

const approvedInfoText: React.CSSProperties = {
  marginTop: 8,
  color:
    "rgba(255,255,255,.65)",
  fontSize: 11,
  lineHeight: 1.8,
};

const expiryText: React.CSSProperties = {
  marginTop: 8,
  color: "#ffd477",
  fontSize: 10,
};

const registrationActions: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 10,
  marginTop: 12,
};

const whatsappButton: React.CSSProperties = {
  padding: "13px 18px",
  background: "#25D366",
  color: "#fff",
  border: 0,
  cursor: "pointer",
  fontWeight: 700,
};

const registrationLinkButton: React.CSSProperties = {
  padding: "13px 18px",
  background:
    "rgba(0,140,255,.08)",
  color: "#32baff",
  border:
    "1px solid rgba(0,140,255,.28)",
  cursor: "pointer",
};

/* =========================================================
   LOGIN STYLES
========================================================= */

const loginContainer: React.CSSProperties = {
  minHeight:
    "calc(100vh - 60px)",
  display: "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
};

const loginCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 430,
  padding: 35,
  background:
    "rgba(3,8,18,.95)",
  border:
    "1px solid rgba(0,140,255,.2)",
  boxSizing:
    "border-box",
};

const loginTitle: React.CSSProperties = {
  fontFamily:
    "Georgia, serif",
  fontSize: 30,
  fontWeight: 400,
  margin:
    "12px 0",
};

const loginLabel: React.CSSProperties = {
  display: "block",
  color: "#c7a85d",
  fontSize: 11,
  marginTop: 18,
  marginBottom: 8,
};

const loginInput: React.CSSProperties = {
  width: "100%",
  boxSizing:
    "border-box",
  padding:
    "13px 14px",
  background:
    "rgba(0,0,0,.35)",
  color: "#fff",
  border:
    "1px solid rgba(0,140,255,.2)",
  outline: "none",
  fontSize: 14,
};

const loginButton: React.CSSProperties = {
  width: "100%",
  marginTop: 25,
  padding: 14,
  background:
    "#008cff",
  color: "#fff",
  border: 0,
  cursor: "pointer",
  fontSize: 14,
};