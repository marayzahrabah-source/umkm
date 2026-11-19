import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createMemberSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  role: z.enum(["admin", "cashier"]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { data: requester } = await supabase
      .from("users")
      .select("business_id, role")
      .eq("id", user.id)
      .single();

    if (!requester || requester.role !== "owner") {
      return NextResponse.json(
        { error: "Hanya Owner yang dapat menambahkan anggota tim" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }

    const { fullName, email, password, role } = parsed.data;
    const admin = createAdminClient();

    const { data: createdAuth, error: authErr } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (authErr || !createdAuth.user) {
      return NextResponse.json(
        { error: authErr?.message || "Gagal membuat akun auth" },
        { status: 400 }
      );
    }

    const { error: insertErr } = await admin.from("users").insert({
      id: createdAuth.user.id,
      business_id: requester.business_id,
      full_name: fullName,
      email,
      role,
      is_active: true,
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
