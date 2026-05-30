import { NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram";

// GET /api/telegram/setup — bir marta chaqirib webhook o'rnatish
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;

  if (!appUrl || !botToken) {
    return NextResponse.json(
      {
        error: "NEXT_PUBLIC_APP_URL yoki TELEGRAM_BOT_TOKEN .env da yo'q",
        appUrl: appUrl || "❌ yo'q",
        botToken: botToken ? "✅ bor" : "❌ yo'q",
      },
      { status: 500 }
    );
  }

  const webhookUrl = `${appUrl.replace(/\/+$/, "")}/api/telegram/webhook`;

  try {
    // Telegram API ga to'g'ridan-to'g'ri so'rov
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
          drop_pending_updates: true,
        }),
      }
    );

    const data = await res.json();

    // Webhook info ham olaylik
    const infoRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    );
    const info = await infoRes.json();

    return NextResponse.json({
      success: data.ok,
      message: data.description || "Webhook o'rnatildi",
      webhookUrl,
      botUsername,
      webhookInfo: info.result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Telegram API ga ulanishda xatolik", details: String(error) },
      { status: 500 }
    );
  }
}
