// Telegram Bot API yordamchi funksiyalar

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// 6 xonali OTP kod generatsiya qilish
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Telegram ga xabar yuborish
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML"
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Webhook o'rnatish
export async function setWebhook(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// OTP xabar matni (chiroyli formatda)
export function buildOTPMessage(code: string, firstName: string): string {
  const formatted = `${code.slice(0, 3)} ${code.slice(3)}`;
  return `
🌙 <b>Assalomu alaykum, ${firstName}!</b>

EXTIYOJ ilovasiga kirish kodi:

<code>${formatted}</code>

⏰ Kod <b>5 daqiqa</b> amal qiladi
🔒 Bu kodni hech kimga bermang

Agar siz emas kirmoqchi bo'layotgan bo'lsangiz — bu xabarni e'tiborsiz qoldiring.
  `.trim();
}

// Telegram Update type
export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
};
