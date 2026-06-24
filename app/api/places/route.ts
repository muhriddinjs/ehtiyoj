import { NextRequest, NextResponse } from "next/server";

// ---- Toshkent fallback data ----
const FALLBACK_MOSQUES = [
  { id: 1, name: "Minor masjidi", lat: 41.2986, lon: 69.2401, tags: ["Masjid", "Tahorat bor"], address: "Islom Karimov ko'chasi" },
  { id: 2, name: "Hazrati Imom masjidi", lat: 41.3268, lon: 69.2304, tags: ["Masjid", "Juma"], address: "Xast Imom ko'chasi" },
  { id: 3, name: "Ko'kaldosh masjidi", lat: 41.3241, lon: 69.2420, tags: ["Masjid", "Tahorat bor"], address: "Chorsu" },
  { id: 4, name: "Xast Imom masjidi", lat: 41.3265, lon: 69.2296, tags: ["Juma", "Tahorat bor"], address: "Xast Imom" },
  { id: 5, name: "Yunusobod jome masjidi", lat: 41.3650, lon: 69.2987, tags: ["Masjid", "5 mahal"], address: "Yunusobod" },
  { id: 6, name: "Mirzo Ulug'bek masjidi", lat: 41.3042, lon: 69.3302, tags: ["Masjid"], address: "Mirzo Ulug'bek" },
  { id: 7, name: "Beshyog'och masjidi", lat: 41.2801, lon: 69.2250, tags: ["Masjid", "Tahorat bor"], address: "Beshyog'och" },
  { id: 8, name: "Sergeli jome masjidi", lat: 41.2200, lon: 69.2100, tags: ["Juma"], address: "Sergeli" },
];

const FALLBACK_TOILETS = [
  { id: 101, name: "Mega Planet WC", lat: 41.2950, lon: 69.2100, tags: ["Tekin", "Ochiq"], address: "Yunusobod" },
  { id: 102, name: "Toshkent City Park WC", lat: 41.3000, lon: 69.2800, tags: ["Tekin", "Ochiq"], address: "Mirzo Ulug'bek" },
  { id: 103, name: "Chorsu bozori WC", lat: 41.3241, lon: 69.2398, tags: ["Tekin", "Ochiq"], address: "Eski shahar" },
  { id: 104, name: "GUM do'koni WC", lat: 41.3005, lon: 69.2727, tags: ["Pullik", "Ochiq"], address: "Mustaqillik maydoni" },
  { id: 105, name: "Navoi xiyoboni WC", lat: 41.2964, lon: 69.2700, tags: ["Tekin", "Ochiq"], address: "Navoi ko'chasi" },
  { id: 106, name: "Olmazor bozori WC", lat: 41.3100, lon: 69.2000, tags: ["Tekin", "Ochiq"], address: "Olmazor" },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const type = searchParams.get("type");
  const radius = searchParams.get("r") || "5000";

  if (!lat || !lon || !type) {
    return NextResponse.json({ error: "lat, lon va type kerak" }, { status: 400 });
  }

  // Overpass API — GET so'rov (POST 406 beradi, GET ishlatamiz)
  let overpassQuery = "";
  if (type === "masjid") {
    overpassQuery =
      `[out:json][timeout:12];` +
      `(node[amenity=place_of_worship][religion=muslim](around:${radius},${lat},${lon});` +
      `way[amenity=place_of_worship][religion=muslim](around:${radius},${lat},${lon});` +
      `node[building=mosque](around:${radius},${lat},${lon}););` +
      `out center;`;
  } else {
    overpassQuery =
      `[out:json][timeout:12];` +
      `node[amenity=toilets](around:${radius},${lat},${lon});` +
      `out;`;
  }

  try {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ExtiyojApp/1.0 (uz.extiyoj; contact@extiyoj.uz)",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(14000),
    });

    if (!res.ok) throw new Error(`Overpass: ${res.status}`);

    const data = await res.json();

    const places = data.elements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) return null;

        const name =
          el.tags?.name ||
          el.tags?.["name:uz"] ||
          el.tags?.["name:ru"] ||
          (type === "masjid" ? "Masjid" : "Hojatxona");

        const dist = getDistance(parseFloat(lat), parseFloat(lon), elLat, elLon);

        const tags: string[] = [];
        if (type === "masjid") {
          const hasPrayerTimes = el.tags?.prayer_times || el.tags?.["name:uz"]?.includes("jome");
          tags.push(hasPrayerTimes ? "5 mahal" : "Masjid");
          if (el.tags?.wudu === "yes" || el.tags?.toilets === "yes") tags.push("Tahorat bor");
        } else {
          tags.push(el.tags?.fee === "yes" ? "Pullik" : "Tekin");
          if (el.tags?.access !== "private") tags.push("Ochiq");
          if (el.tags?.["toilets:disposal"] === "flush") tags.push("Zamonaviy");
        }

        return {
          id: el.id,
          name,
          lat: elLat,
          lon: elLon,
          distM: Math.round(dist),
          tags,
          address:
            [el.tags?.["addr:street"], el.tags?.["addr:housenumber"]]
              .filter(Boolean)
              .join(", ") ||
            el.tags?.["addr:full"] ||
            "",
          phone: el.tags?.phone || el.tags?.["contact:phone"] || "",
          openingHours: el.tags?.opening_hours || "",
          website: el.tags?.website || el.tags?.["contact:website"] || "",
        };
      })
      .filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.distM - b.distM)
      .slice(0, 25);

    if (places.length === 0) throw new Error("empty");
    return NextResponse.json({ places, source: "osm" });
  } catch (err) {
    // Fallback — Toshkent statik ma'lumotlari
    console.log("Overpass fallback:", err);
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const fallback = type === "masjid" ? FALLBACK_MOSQUES : FALLBACK_TOILETS;
    const places = fallback
      .map((p) => ({ ...p, distM: Math.round(getDistance(userLat, userLon, p.lat, p.lon)), phone: "", openingHours: "", website: "" }))
      .sort((a, b) => a.distM - b.distM);
    return NextResponse.json({ places, source: "fallback" });
  }
}
