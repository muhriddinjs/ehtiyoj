import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// Bugungi tasbexni olish yoki yangilash
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ count: 0 });

  const db = supabaseAdmin();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await db
    .from("tasbex_records")
    .select("count")
    .eq("user_id", session.userId)
    .eq("date", today)
    .single();

  return NextResponse.json({ count: data?.count || 0 });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const { count } = await req.json();
  const db = supabaseAdmin();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await db
    .from("tasbex_records")
    .upsert(
      { user_id: session.userId, count, date: today },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  return NextResponse.json({ count: data.count });
}
