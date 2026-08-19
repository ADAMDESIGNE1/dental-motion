import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const {
      data,
      error,
    } = await supabaseAdmin
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
        approved_at,
        doctors (
          full_name,
          slug
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requests: data || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "حدث خطأ أثناء تحميل الطلبات.",
      },
      { status: 500 }
    );
  }
}