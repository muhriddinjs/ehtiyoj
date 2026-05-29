import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateOTPCode, buildOTPMessage, sendTelegramMessage, type TelegramUpdate } from "@/lib/telegram";

// Telegram Webhook — bot /start olganda chaqiriladi
export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const { id: chatId, first_name, last_name, username } = message.from;
    const text = message.text.trim();

    // /start komandasi
    if (text === "/start" || text.startsWith("/start")) {
      const db = supabaseAdmin();

      // OTP kod generatsiya qilish
      const code = generateOTPCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

      // Eski kodlarni o'chirish
      await db
        .from("bot_codes")
        .delete()
        .eq("telegram_chat_id", chatId)
        .eq("used", false);

      // Yangi kodni saqlash
      const { error } = await db.from("bot_codes").insert({
        code,
        telegram_chat_id: chatId,
        user_data: {
          id: chatId,
          first_name,
          last_name: last_name || "",
          username: username || "",
        },
        used: false,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        await sendTelegramMessage(
          chatId,
          "❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring."
        );
        return NextResponse.json({ ok: true });
      }

      // Kodni yuborish
      const otp = buildOTPMessage(code, first_name);
      await sendTelegramMessage(chatId, otp);

      return NextResponse.json({ ok: true });
    }

    // Boshqa xabarlar
    await sendTelegramMessage(
      chatId,
      `👋 Salom, <b>${first_name}</b>!\n\nKirish uchun <b>/start</b> ni bosing.`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET — webhook holatini tekshirish
export async function GET() {
  return NextResponse.json({ status: "Webhook active", bot: process.env.TELEGRAM_BOT_USERNAME });
}
