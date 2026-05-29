"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import BottomNav from "@/components/layout/BottomNav";
import YandexMap from "@/components/places/YandexMap";
import PlaceList from "@/components/places/PlaceList";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distM: number;
  tags: string[];
  address: string;
};

export default function ZaruratPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filtered, setFiltered] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");
  const [search, setSearch] = useState("");
  const [distFilter, setDistFilter] = useState("Hammasi");
  const [tagFilter, setTagFilter] = useState("Hammasi");
  const [nearest, setNearest] = useState<Place | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const DIST_OPTS = ["Hammasi", "500 m", "1 km", "2 km", "5 km"];
  const TAG_OPTS = ["Hammasi", "Tekin", "Pullik", "Ochiq"];

  // Joylashuvni olish va joylarni yuklash
  useEffect(() => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLoc({ lat, lon });
        await loadPlaces(lat, lon);
        setLocLoading(false);
      },
      () => {
        // Toshkent fallback
        loadPlaces(41.2995, 69.2401);
        setUserLoc({ lat: 41.2995, lon: 69.2401 });
        setLocLoading(false);
      }
    );
  }, []);

  const loadPlaces = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/places?lat=${lat}&lon=${lon}&type=hojatxona&r=5000`);
      const data = await res.json();
      setPlaces(data.places || []);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtr
  useEffect(() => {
    let result = [...places];

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (distFilter !== "Hammasi") {
      const maxM =
        distFilter === "500 m" ? 500
        : distFilter === "1 km" ? 1000
        : distFilter === "2 km" ? 2000
        : 5000;
      result = result.filter((p) => p.distM <= maxM);
    }

    if (tagFilter !== "Hammasi") {
      result = result.filter((p) => p.tags.includes(tagFilter));
    }

    setFiltered(result);
  }, [places, search, distFilter, tagFilter]);

  const findNearest = () => {
    if (places.length > 0) {
      setNearest(places[0]);
      setView("list");
    }
  };

  const distLabel = (m: number) =>
    m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(4,13,31,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(56,189,248,0.06)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Zarurat</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Yaqin hojatxonalar
          </div>
        </div>
        <button
          onClick={findNearest}
          style={{
            background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
            border: "none",
            borderRadius: 12,
            padding: "8px 14px",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 12px rgba(56,189,248,0.3)",
          }}
        >
          📍 Eng yaqin
        </button>
      </header>

      <div style={{ padding: "0 0 88px" }}>
        {/* Nearest banner */}
        {nearest && (
          <div
            className="page-enter"
            style={{
              margin: "12px 16px 0",
              background: "rgba(56,189,248,0.06)",
              border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>📍</span>
            <div>
              <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginBottom: 2 }}>
                Eng yaqin joy
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{nearest.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {distLabel(nearest.distM)} • {nearest.tags.join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div
          className="search-wrapper"
          style={{ margin: "12px 16px 8px" }}
        >
          <span className="search-icon" style={{ fontSize: 16 }}>🔍</span>
          <input
            className="input-field"
            style={{ paddingLeft: 44 }}
            placeholder="Hojatxona qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* View switch */}
        <div
          style={{
            margin: "0 16px 8px",
            background: "var(--surface)",
            borderRadius: 14,
            padding: 4,
            display: "flex",
            border: "1px solid var(--border)",
          }}
        >
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1,
                background: view === v
                  ? "linear-gradient(135deg, #0EA5E9, #38BDF8)"
                  : "transparent",
                color: view === v ? "#fff" : "var(--muted)",
                border: "none",
                borderRadius: 10,
                padding: "8px 0",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {v === "map" ? "🗺 Xarita" : "📋 Ro'yxat"}
            </button>
          ))}
        </div>

        {/* Map */}
        {view === "map" && userLoc && (
          <div style={{ margin: "0 16px 8px" }}>
            <YandexMap
              lat={userLoc.lat}
              lon={userLoc.lon}
              places={filtered.slice(0, 10)}
              type="hojatxona"
              nearest={nearest?.id}
            />
          </div>
        )}

        {/* Distance chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "0 16px 8px",
            scrollbarWidth: "none",
          }}
        >
          {DIST_OPTS.map((d) => (
            <button
              key={d}
              onClick={() => setDistFilter(d)}
              className={`chip ${distFilter === d ? "active" : ""}`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Tag chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "0 16px 10px",
            scrollbarWidth: "none",
          }}
        >
          {TAG_OPTS.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(t)}
              className={`chip ${tagFilter === t ? "active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results */}
        <div style={{ padding: "0 16px" }}>
          {locLoading ? (
            <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "var(--muted)" }}>
              📡 Joylashuv aniqlanmoqda...
            </div>
          ) : (
            <PlaceList
              places={filtered}
              loading={loading}
              type="hojatxona"
              nearest={nearest?.id}
            />
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
