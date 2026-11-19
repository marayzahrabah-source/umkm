import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const registerSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  businessName: z.string().min(2, "Nama usaha minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }

    const { userId, fullName, businessName, email, phone } = parsed.data;
    const admin = createAdminClient();

    // 1. Create business
    const { data: business, error: bizError } = await admin
      .from("businesses")
      .insert({
        name: businessName,
        owner_name: fullName,
        email,
        phone: phone || null,
      })
      .select()
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { error: bizError?.message || "Gagal membuat profil usaha" },
        { status: 500 }
      );
    }

    // 2. Create owner user profile
    const { error: userError } = await admin.from("users").insert({
      id: userId,
      business_id: business.id,
      full_name: fullName,
      email,
      phone: phone || null,
      role: "owner",
      is_active: true,
    });

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, businessId: business.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
