import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, note, lat, lon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Nom kiritilishi shart" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("suggestions")
      .insert({
        name: name.trim(),
        note: note?.trim() || "",
        lat: lat || null,
        lon: lon || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Suggest insert error:", JSON.stringify(error));
      return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, suggestion: data });
  } catch (err) {
    console.error("Suggest API error:", err);
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("suggestions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ suggestions: [] });
    return NextResponse.json({ suggestions: data });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
