import type {
  Metadata,
} from "next";
import {
  createClient,
} from "@supabase/supabase-js";

type DoctorMeta = {
  id: string;
  slug: string | null;
  full_name: string | null;
  specialty: string | null;
  sub_specialty: string | null;
  profile_image: string | null;
  cover_image: string | null;
  clinic_logo: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  subscription_active: boolean | null;
  subscription_expires_at: string | null;
  is_approved: boolean | null;
};

const FALLBACK_SITE =
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  "https://adam-designe.netlify.app";

async function loadDoctor(
  identifier: string
): Promise<DoctorMeta | null> {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    return null;
  }

  const supabase =
    createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

  const fields =
    "id,slug,full_name,specialty,sub_specialty,profile_image,cover_image,clinic_logo,clinic_name,clinic_address,phone,whatsapp_number,subscription_active,subscription_expires_at,is_approved";

  const {
    data: slugData,
  } = await supabase
    .from("doctors")
    .select(fields)
    .eq("slug", identifier)
    .maybeSingle();

  if (slugData) {
    return slugData as DoctorMeta;
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identifier
    );

  if (!isUuid) {
    return null;
  }

  const {
    data: idData,
  } = await supabase
    .from("doctors")
    .select(fields)
    .eq("id", identifier)
    .maybeSingle();

  return (
    idData as DoctorMeta | null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}): Promise<Metadata> {
  const {
    id,
  } = await params;

  const doctor =
    await loadDoctor(id);

  const fallback: Metadata = {
    metadataBase:
      new URL(FALLBACK_SITE),
    title:
      "ADAM DESIGN | Doctor Profile",
    description:
      "صفحة طبيب احترافية على ADAM DESIGN.",
  };

  if (!doctor) {
    return fallback;
  }

  const expiry =
    doctor.subscription_expires_at
      ? new Date(
          doctor.subscription_expires_at
        ).getTime()
      : 0;

  const isPublic =
    doctor.subscription_active ===
      true &&
    doctor.is_approved === true &&
    expiry > Date.now();

  if (!isPublic) {
    return fallback;
  }

  const doctorName =
    doctor.full_name ||
    "Doctor";

  const specialty =
    doctor.sub_specialty ||
    doctor.specialty ||
    "Dental Specialist";

  const title =
    `د. ${doctorName} | ${specialty}`;

  const clinicLabel =
    doctor.clinic_name
      ? ` في ${doctor.clinic_name}`
      : "";

  const description =
    `الموقع الرسمي للطبيب د. ${doctorName}${clinicLabel} — ${specialty}. تعرف على الحالات والخدمات ومعلومات العيادة وطرق التواصل.`;

  const canonicalPath =
    `/doctor/${
      doctor.slug || doctor.id
    }`;

  const image =
    doctor.cover_image ||
    doctor.profile_image ||
    doctor.clinic_logo ||
    `${FALLBACK_SITE}/logo.png`;

  return {
    metadataBase:
      new URL(FALLBACK_SITE),
    title,
    description,
    alternates: {
      canonical:
        canonicalPath,
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonicalPath,
      siteName:
        "ADAM DESIGN",
      images: [
        {
          url: image,
          alt:
            `د. ${doctorName}`,
        },
      ],
    },
    twitter: {
      card:
        "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function DoctorLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return children;
}