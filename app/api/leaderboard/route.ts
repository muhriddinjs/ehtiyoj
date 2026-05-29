import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("leaderboard")
    .select("*")
    .limit(100);

  if (error) return NextResponse.json({ entries: [] });
  return NextResponse.json({ entries: data });
}
