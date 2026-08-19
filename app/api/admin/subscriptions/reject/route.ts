import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const requestId = body.requestId;

    if (!requestId) {
      return NextResponse.json(
        {
          error:
            "رقم طلب الاشتراك مفقود.",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin.rpc(
      "reject_subscription_request",
      {
        request_id: requestId,
        admin_note_text:
          body.adminNote || null,
      }
    );

    if (error) {
      console.error(
        "REJECT ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "حدث خطأ أثناء رفض الطلب.",
      },
      { status: 500 }
    );
  }
}