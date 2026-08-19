import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  data: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed",
      },
      405
    );
  }

  try {
    /* =====================================================
       SECRETS
    ===================================================== */

    const TELEGRAM_BOT_TOKEN =
      Deno.env.get("TELEGRAM_BOT_TOKEN");

    const TELEGRAM_CHAT_ID =
      Deno.env.get("TELEGRAM_CHAT_ID");

    const SUPABASE_URL =
      Deno.env.get("SUPABASE_URL");

    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    /* =====================================================
       CHECK SECRETS
    ===================================================== */

    if (!TELEGRAM_BOT_TOKEN) {
      return jsonResponse(
        {
          error:
            "TELEGRAM_BOT_TOKEN is not configured.",
        },
        500
      );
    }

    if (!TELEGRAM_CHAT_ID) {
      return jsonResponse(
        {
          error:
            "TELEGRAM_CHAT_ID is not configured.",
        },
        500
      );
    }

    if (!SUPABASE_URL) {
      return jsonResponse(
        {
          error:
            "SUPABASE_URL is not configured.",
        },
        500
      );
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured.",
        },
        500
      );
    }

    /* =====================================================
       BODY
    ===================================================== */

    const body = await req.json();

    const requestId =
      body?.request_id;

    if (!requestId) {
      return jsonResponse(
        {
          error:
            "request_id is required.",
        },
        400
      );
    }

    /* =====================================================
       SUPABASE ADMIN CLIENT
    ===================================================== */

    const supabase =
      createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

    /* =====================================================
       GET SUBSCRIPTION REQUEST
    ===================================================== */

    const {
      data: request,
      error: requestError,
    } = await supabase
      .from(
        "subscription_requests"
      )
      .select(
        `
          id,
          doctor_id,
          doctor_name,
          whatsapp_number,
          phone,
          plan,
          duration_days,
          payment_method,
          transfer_number,
          receipt_url,
          status,
          created_at
        `
      )
      .eq(
        "id",
        requestId
      )
      .single();

    if (requestError) {
      console.error(
        "REQUEST ERROR:",
        requestError
      );

      return jsonResponse(
        {
          error:
            "Failed to load subscription request.",
          details:
            requestError.message,
          code:
            requestError.code,
        },
        500
      );
    }

    if (!request) {
      return jsonResponse(
        {
          error:
            "Subscription request not found.",
        },
        404
      );
    }

    /* =====================================================
       DATA
    ===================================================== */

    const doctorName =
      request.doctor_name ||
      "غير معروف";

    const whatsapp =
      request.whatsapp_number ||
      request.phone ||
      "غير مسجل";

    const planName =
      request.plan === "premium"
        ? "الباقة المميزة"
        : "الباقة العادية";

    const paymentName =
      request.payment_method ===
      "zaincash"
        ? "Zain Cash"
        : "K-Card";

    /* =====================================================
       TELEGRAM MESSAGE
    ===================================================== */

    const message = `
🔔 طلب اشتراك جديد

🆔 رقم الطلب:
${request.id}

👨‍⚕️ اسم الطبيب:
${doctorName}

📦 الباقة:
${planName}

⏳ مدة الاشتراك:
${request.duration_days} يوم

💳 طريقة الدفع:
${paymentName}

📱 WhatsApp:
${whatsapp}

🔢 رقم الوصل:
${request.transfer_number}

📊 الحالة:
قيد المراجعة

🧾 صورة الوصل:
${request.receipt_url}

━━━━━━━━━━━━━━━━━━

يرجى فتح لوحة الإدارة لمراجعة الطلب والموافقة عليه.
`;

    /* =====================================================
       SEND TELEGRAM
    ===================================================== */

    const telegramResponse =
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            chat_id:
              TELEGRAM_CHAT_ID,

            text: message,

            disable_web_page_preview:
              false,
          }),
        }
      );

    const telegramResult =
      await telegramResponse.json();

    /* =====================================================
       TELEGRAM ERROR
    ===================================================== */

    if (
      !telegramResponse.ok ||
      !telegramResult.ok
    ) {
      console.error(
        "TELEGRAM ERROR:",
        telegramResult
      );

      return jsonResponse(
        {
          error:
            "Failed to send Telegram message.",

          details:
            telegramResult?.description ||
            telegramResult,
        },
        500
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return jsonResponse({
      success: true,

      message:
        "Telegram notification sent successfully.",

      request_id:
        request.id,
    });
  } catch (error) {
    console.error(
      "FUNCTION ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500
    );
  }
});