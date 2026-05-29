import { NextRequest, NextResponse } from "next/server";

// Aladhan API — bepul namoz vaqtlari
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "41.2995";
  const lon = searchParams.get("lon") || "69.2401";

  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=2`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // 1 soatga cache
    });

    if (!res.ok) throw new Error("Aladhan API xatoligi");

    const data = await res.json();
    const timings = data.data.timings;

    const prayers = [
      { id: "bomdod", name: "Bomdod", time: timings.Fajr, icon: "🌙" },
      { id: "quyosh", name: "Quyosh", time: timings.Sunrise, icon: "🌅" },
      { id: "peshin", name: "Peshin", time: timings.Dhuhr, icon: "☀️" },
      { id: "asr", name: "Asr", time: timings.Asr, icon: "🌤" },
      { id: "shom", name: "Shom", time: timings.Maghrib, icon: "🌆" },
      { id: "xufton", name: "Xufton", time: timings.Isha, icon: "🌃" },
    ];

    // Hozirgi namozni aniqlash
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let currentIdx = 0;
    for (let i = 0; i < prayers.length; i++) {
      const [h, m] = prayers[i].time.split(":").map(Number);
      const prayerMinutes = h * 60 + m;
      if (nowMinutes >= prayerMinutes) currentIdx = i;
    }

    return NextResponse.json({
      prayers,
      currentIdx,
      date: data.data.date.readable,
      hijri: data.data.date.hijri.date,
    });
  } catch (error) {
    // Fallback — Toshkent vaqtlari (taxminiy)
    return NextResponse.json({
      prayers: [
        { id: "bomdod", name: "Bomdod", time: "04:52", icon: "🌙" },
        { id: "quyosh", name: "Quyosh", time: "06:28", icon: "🌅" },
        { id: "peshin", name: "Peshin", time: "13:05", icon: "☀️" },
        { id: "asr", name: "Asr", time: "17:22", icon: "🌤" },
        { id: "shom", name: "Shom", time: "20:10", icon: "🌆" },
        { id: "xufton", name: "Xufton", time: "21:45", icon: "🌃" },
      ],
      currentIdx: 3,
      date: null,
      hijri: null,
    });
  }
}
