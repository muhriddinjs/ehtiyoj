import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Noto'g'ri kod formati" }, { status: 400 });
    }

    // ===== TEST MODE (faqat development) =====
    if (process.env.NODE_ENV === "development" && code === "123456") {
      const token = await createSessionToken({
        userId: 999999,
        firstName: "Test Foydalanuvchi",
        username: "testuser",
        sticker: "🌙",
      });
      const response = NextResponse.json({
        success: true,
        user: { id: 999999, firstName: "Test Foydalanuvchi", username: "testuser", sticker: "🌙" },
        testMode: true,
      });
      response.cookies.set(setSessionCookie(token));
      return response;
    }
    // =========================================

    const db = supabaseAdmin();

    // Kodni bazadan topish
    const { data: botCode, error: codeError } = await db
      .from("bot_codes")
      .select("*")
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (codeError || !botCode) {
      return NextResponse.json(
        { error: "Kod noto'g'ri yoki muddati o'tgan" },
        { status: 400 }
      );
    }

    const userData = botCode.user_data as {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
    };

    // Foydalanuvchini yaratish yoki yangilash
    const { data: user, error: userError } = await db
      .from("users")
      .upsert(
        {
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: "Foydalanuvchi yaratishda xatolik" }, { status: 500 });
    }

    // Kodni ishlatilgan deb belgilash
    await db.from("bot_codes").update({ used: true }).eq("code", code);

    // JWT token yaratish
    const token = await createSessionToken({
      userId: user.id,
      firstName: user.first_name,
      username: user.username,
      sticker: user.sticker,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        username: user.username,
        sticker: user.sticker,
      },
    });
    response.cookies.set(setSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
