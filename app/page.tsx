"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CirclesThree,
  MapTrifold,
  CompassRose,
  UserCircle,
  ArrowsClockwise,
  MapPin,
  WifiSlash,
  Clock,
  CheckCircle,
  Trash,
  Moon,
  Sun,
  SealCheck,
  Bell,
  Info,
  ArrowRight,
  CaretRight,
  WifiHigh
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import PlaceList from "@/components/places/PlaceList";

// Yandex Map ni client-side dynamic import
const YandexMap = dynamic(() => import("@/components/places/YandexMap"), {
  ssr: false,
  loading: () => (
    <div
      className="shimmer"
      style={{ height: 240, borderRadius: 20, border: "1px solid var(--border)" }}
    />
  ),
});

// ============================================================
// Types
// ============================================================
type Tab = "xarita" | "qibla" | "tasbeh" | "profil";
type PlaceType = "masjid" | "hojatxona";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distM: number;
  tags: string[];
  address: string;
};

type Prayer = {
  id: string;
  name: string;
  time: string;
  icon: string;
};

// ============================================================
// Main App Shell
// ============================================================
export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("xarita");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 76,
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        {activeTab === "xarita" && <XaritaScreen />}
        {activeTab === "qibla" && <QiblaScreen />}
        {activeTab === "tasbeh" && <TasbehScreen />}
        {activeTab === "profil" && <ProfilScreen dark={dark} onToggle={toggleTheme} />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// ============================================================
// Bottom Navigation Bar
// ============================================================
function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: "xarita",
      label: "Xarita",
      icon: (active) => (
        <MapTrifold
          size={24}
          weight={active ? "fill" : "regular"}
        />
      ),
    },
    {
      id: "qibla",
      label: "Qibla",
      icon: (active) => (
        <CompassRose
          size={24}
          weight={active ? "fill" : "regular"}
        />
      ),
    },
    {
      id: "tasbeh",
      label: "Tasbeh",
      icon: (active) => (
        <CirclesThree
          size={24}
          weight={active ? "fill" : "regular"}
        />
      ),
    },
    {
      id: "profil",
      label: "Profil",
      icon: (active) => (
        <UserCircle
          size={24}
          weight={active ? "fill" : "regular"}
        />
      ),
    },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        zIndex: 50,
        borderTop: "1px solid var(--border)",
      }}
      className="bg-white/[0.92] dark:bg-[#0F172A]/[0.95] backdrop-blur-xl"
    >
      <div style={{ display: "flex" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                minHeight: 60,
                paddingTop: 10,
                paddingBottom: 10,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s",
                color: isActive ? "#059669" : "var(--muted)",
                position: "relative",
              }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#059669",
                  }}
                />
              )}
              {tab.icon(isActive)}
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, lineHeight: 1.2 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ height: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
}

// ============================================================
// Screen: Xarita
// ============================================================
function XaritaScreen() {
  const [placeType, setPlaceType] = useState<PlaceType>("masjid");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locationError, setLocationError] = useState("");
  const [source, setSource] = useState<"osm" | "fallback" | "">("");

  const fetchPlaces = useCallback(
    async (lat: number, lon: number, type: PlaceType) => {
      setLoading(true);
      setPlaces([]);
      setSelectedPlace(null);
      try {
        const res = await fetch(
          `/api/places?lat=${lat}&lon=${lon}&type=${type === "hojatxona" ? "hojatxona" : "masjid"}`
        );
        const data = await res.json();
        setPlaces(data.places || []);
        setSource(data.source || "");
      } catch {
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getLocation = useCallback(() => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolokatsiya qo'llab-quvvatlanmaydi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        fetchPlaces(latitude, longitude, placeType);
      },
      () => {
        setLocationError("Joylashuv aniqlanmadi. Toshkent markazi ishlatilmoqda.");
        const lat = 41.2995;
        const lon = 69.2401;
        setUserLat(lat);
        setUserLon(lon);
        fetchPlaces(lat, lon, placeType);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [fetchPlaces, placeType]);

  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userLat && userLon) {
      fetchPlaces(userLat, userLon, placeType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeType]);

  const nearest = places.length > 0 ? places[0].id : undefined;

  return (
    <div className="animate-fade-up" style={{ padding: "16px 16px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
          Yaqin joylar
        </h1>
        <button
          onClick={getLocation}
          disabled={loading}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "8px 12px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            fontFamily: "inherit",
            opacity: loading ? 0.5 : 1,
          }}
        >
          <ArrowsClockwise
            size={15}
            weight="bold"
            style={loading ? { animation: "spin 1s linear infinite" } : {}}
          />
          Yangilash
        </button>
      </div>

      {locationError && (
        <div
          style={{
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 12,
            color: "#D97706",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MapPin size={15} weight="fill" style={{ flexShrink: 0, color: "#D97706" }} />
          {locationError}
        </div>
      )}

      {/* Type toggle */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 4,
        }}
      >
        {(["masjid", "hojatxona"] as PlaceType[]).map((t) => (
          <button
            key={t}
            onClick={() => setPlaceType(t)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 11,
              border: "none",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s",
              background:
                placeType === t
                  ? t === "masjid"
                    ? "linear-gradient(135deg, #059669, #34D399)"
                    : "linear-gradient(135deg, #0EA5E9, #38BDF8)"
                  : "transparent",
              color: placeType === t ? "white" : "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>{t === "masjid" ? "🕌" : "🚻"}</span>
            {t === "masjid" ? "Masjidlar" : "Hojatxonalar"}
          </button>
        ))}
      </div>

      {userLat && userLon && (
        <div style={{ marginBottom: 14 }}>
          <YandexMap
            lat={userLat}
            lon={userLon}
            places={places}
            type={placeType}
            nearest={nearest}
            selectedPlace={selectedPlace}
          />
        </div>
      )}

      {source === "fallback" && (
        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            textAlign: "center",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <WifiSlash size={13} weight="bold" />
          Offline ma&apos;lumotlar ko&apos;rsatilmoqda
        </div>
      )}

      <PlaceList
        places={places}
        loading={loading}
        type={placeType}
        nearest={nearest}
        onPlaceClick={setSelectedPlace}
      />
    </div>
  );
}

// ============================================================
// Screen: Qibla + Namoz Vaqtlari
// ============================================================
function QiblaScreen() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [hijri, setHijri] = useState<string | null>(null);
  const [loadingPrayers, setLoadingPrayers] = useState(true);
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaAngle] = useState(270);
  const [compassError, setCompassError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/prayer-times?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          setPrayers(data.prayers || []);
          setCurrentIdx(data.currentIdx || 0);
          setDate(data.date);
          setHijri(data.hijri);
        } catch {
          loadFallback();
        } finally {
          setLoadingPrayers(false);
        }
      },
      () => loadFallback()
    );

    async function loadFallback() {
      try {
        const res = await fetch("/api/prayer-times");
        const data = await res.json();
        setPrayers(data.prayers || []);
        setCurrentIdx(data.currentIdx || 0);
        setDate(data.date);
        setHijri(data.hijri);
      } catch { /* noop */ }
      finally { setLoadingPrayers(false); }
    }
  }, []);

  useEffect(() => {
    function handleOrientation(e: DeviceOrientationEvent) {
      const alpha = (e as any).webkitCompassHeading ?? (360 - (e.alpha ?? 0));
      setHeading(Math.round(alpha));
    }

    if (window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        setCompassError("Kompasni yoqish uchun pastdagi tugmani bosing");
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    } else {
      setCompassError("Qurilmangiz kompasni qo'llab-quvvatlamaydi");
    }
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  async function requestCompass() {
    try {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === "granted") {
        setCompassError("");
        window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
          const alpha = (e as any).webkitCompassHeading ?? (360 - (e.alpha ?? 0));
          setHeading(Math.round(alpha));
        }, true);
      } else {
        setCompassError("Kompas ruxsati berilmadi");
      }
    } catch {
      setCompassError("Kompas ruxsati so'rovida xatolik");
    }
  }

  const needleAngle = heading !== null ? qiblaAngle - heading : 0;

  return (
    <div className="animate-fade-up" style={{ padding: "16px 16px 0" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 16 }}>
        Qibla &amp; Namoz Vaqtlari
      </h1>

      {/* Compass card */}
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 14 }}>
        {compassError ? (
          <div style={{ textAlign: "center" }}>
            <CompassRose size={56} weight="duotone" style={{ color: "#059669", marginBottom: 12 }} />
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>{compassError}</div>
            {typeof (DeviceOrientationEvent as any).requestPermission === "function" && (
              <button className="btn-primary" style={{ maxWidth: 200 }} onClick={requestCompass}>
                Kompasni yoqish
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <svg width={180} height={180}>
                {/* Outer ring */}
                <circle cx={90} cy={90} r={84} fill="none" stroke="var(--border)" strokeWidth={1} />
                {/* Tick marks */}
                {Array.from({ length: 36 }, (_, i) => {
                  const angle = (i * 10 - 90) * (Math.PI / 180);
                  const isMajor = i % 9 === 0;
                  const r1 = isMajor ? 78 : 81;
                  const r2 = 84;
                  return (
                    <line
                      key={i}
                      x1={90 + r1 * Math.cos(angle)}
                      y1={90 + r1 * Math.sin(angle)}
                      x2={90 + r2 * Math.cos(angle)}
                      y2={90 + r2 * Math.sin(angle)}
                      stroke={isMajor ? "var(--muted)" : "var(--border)"}
                      strokeWidth={isMajor ? 2 : 1}
                    />
                  );
                })}
                {/* Cardinal labels */}
                {[
                  { label: "S", angle: 0 },
                  { label: "G", angle: 90 },
                  { label: "J", angle: 180 },
                  { label: "Sh", angle: 270 },
                ].map(({ label, angle }) => {
                  const rad = (angle - 90) * (Math.PI / 180);
                  return (
                    <text
                      key={label}
                      x={90 + 66 * Math.cos(rad)}
                      y={90 + 66 * Math.sin(rad) + 4}
                      textAnchor="middle"
                      fontSize={label === "Sh" ? 9 : 11}
                      fontWeight={800}
                      fill={label === "S" ? "#F43F5E" : "var(--muted)"}
                      fontFamily="inherit"
                    >
                      {label}
                    </text>
                  );
                })}
                {/* Inner circle */}
                <circle cx={90} cy={90} r={50} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
              </svg>

              {/* Compass needle (rotates) */}
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: 180, height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `rotate(${needleAngle}deg)`,
                  transition: "transform 0.15s ease-out",
                }}
              >
                <svg width={8} height={80} style={{ position: "absolute", top: 50, left: 86 }}>
                  <polygon points="4,0 8,40 4,36 0,40" fill="#059669" />
                  <polygon points="4,80 8,40 4,44 0,40" fill="var(--border)" />
                </svg>
              </div>

              {/* Kaaba center */}
              <div style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 20,
                lineHeight: 1,
              }}>
                🕋
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
              {heading !== null ? (
                <>
                  Kompas:{" "}
                  <strong style={{ color: "var(--text)" }}>{heading}°</strong>
                  {" · "}
                  Qibla:{" "}
                  <strong style={{ color: "#059669" }}>{qiblaAngle}°</strong>
                </>
              ) : (
                "Kompas ma'lumoti kutilmoqda..."
              )}
            </div>
          </>
        )}
      </div>

      {/* Prayer times card */}
      <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Clock size={18} weight="duotone" style={{ color: "#059669" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{date || "Namoz vaqtlari"}</div>
            {hijri && <div style={{ fontSize: 11, color: "var(--muted)" }}>{hijri}</div>}
          </div>
        </div>

        {loadingPrayers ? (
          <div style={{ padding: "16px" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="shimmer" style={{ height: 40, borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ) : (
          prayers.map((prayer, idx) => (
            <div
              key={prayer.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: idx < prayers.length - 1 ? "1px solid var(--border)" : "none",
                background: idx === currentIdx ? "rgba(5,150,105,0.05)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{prayer.icon}</span>
                <span style={{
                  fontSize: 14,
                  fontWeight: idx === currentIdx ? 700 : 500,
                  color: idx === currentIdx ? "#059669" : "var(--text)",
                }}>
                  {prayer.name}
                </span>
                {idx === currentIdx && (
                  <span style={{
                    fontSize: 9, background: "rgba(5,150,105,0.12)",
                    color: "#059669", borderRadius: 5, padding: "2px 6px", fontWeight: 700,
                  }}>
                    HOZIR
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 16, fontWeight: 800,
                color: idx === currentIdx ? "#059669" : "var(--text)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {prayer.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// Screen: Tasbeh
// ============================================================
function TasbehScreen() {
  const [count, setCount] = useState(0);
  const [target] = useState(33);
  const [syncing, setSyncing] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasbeh_count");
    if (saved) setCount(parseInt(saved, 10));
    const cycle = localStorage.getItem("tasbeh_cycle");
    if (cycle) setCycleCount(parseInt(cycle, 10));
  }, []);

  const tap = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem("tasbeh_count", String(newCount));

    if ("vibrate" in navigator) navigator.vibrate(12);

    if (newCount % target === 0) {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      localStorage.setItem("tasbeh_cycle", String(newCycle));
      if ("vibrate" in navigator) navigator.vibrate([50, 30, 50]);
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1200);
    }

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        await fetch("/api/tasbex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: newCount }),
        });
      } catch { /* noop */ }
      finally { setSyncing(false); }
    }, 2000);
  }, [count, target, cycleCount]);

  function reset() {
    setCount(0);
    setCycleCount(0);
    localStorage.setItem("tasbeh_count", "0");
    localStorage.setItem("tasbeh_cycle", "0");
    if ("vibrate" in navigator) navigator.vibrate([30, 20, 30]);
  }

  const progress = (count % target) / target;
  const circumference = 2 * Math.PI * 72;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px 0" }}>
      {/* Header */}
      <div style={{ width: "100%", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 2 }}>Tasbeh</h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Bugun: <strong style={{ color: "#059669" }}>{cycleCount}</strong> tsikl · Jami:{" "}
          <strong style={{ color: "var(--text)" }}>{count}</strong>
        </p>
      </div>

      {/* Progress ring */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <svg width={200} height={200} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={100} cy={100} r={72} fill="none" stroke="var(--border)" strokeWidth={10} />
          {/* Progress */}
          <circle
            cx={100} cy={100} r={72}
            fill="none"
            stroke="url(#tasbehGrad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.25s ease" }}
          />
          <defs>
            <linearGradient id="tasbehGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>

        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          {justCompleted ? (
            <div style={{ animation: "fadeUp 0.3s ease-out" }}>
              <CheckCircle size={40} weight="fill" style={{ color: "#059669" }} />
            </div>
          ) : (
            <>
              <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, color: "var(--text)" }}>
                {count % target}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>/ {target}</div>
            </>
          )}
        </div>
      </div>

      {/* Tap button */}
      <button
        onClick={tap}
        style={{
          width: 156,
          height: 156,
          borderRadius: "50%",
          border: "none",
          background: justCompleted
            ? "linear-gradient(135deg, #0D9488, #34D399)"
            : "linear-gradient(135deg, #059669, #34D399)",
          boxShadow: justCompleted
            ? "0 16px 56px rgba(5,150,105,0.5)"
            : "0 12px 48px rgba(5,150,105,0.35)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "all 0.1s",
          marginBottom: 28,
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        } as React.CSSProperties}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.93)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(5,150,105,0.3)";
        }}
        onPointerUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 48px rgba(5,150,105,0.35)";
        }}
        onPointerLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 48px rgba(5,150,105,0.35)";
        }}
      >
        <CirclesThree size={44} weight="fill" style={{ color: "white" }} />
        <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 11, letterSpacing: "0.5px" }}>BOSING</span>
      </button>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <div className="card" style={{ flex: 1, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#059669" }}>{cycleCount}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Tsikllar</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text)" }}>{count}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Jami bugun</div>
        </div>
        <button
          onClick={reset}
          className="card"
          style={{
            padding: "14px 16px",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
            fontWeight: 700,
            color: "var(--muted)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            border: "1px solid var(--border)",
          }}
        >
          <Trash size={18} weight="bold" />
          <span style={{ fontSize: 10 }}>Tozala</span>
        </button>
      </div>

      {syncing && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <WifiSlash size={12} weight="bold" />
          Saqlanmoqda...
        </div>
      )}
    </div>
  );
}

// ============================================================
// Screen: Profil — to'liq qayta yozildi
// ============================================================
function ProfilScreen({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  const [tasbehCount, setTasbehCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    const c = localStorage.getItem("tasbeh_count");
    const cy = localStorage.getItem("tasbeh_cycle");
    if (c) setTasbehCount(parseInt(c, 10));
    if (cy) setCycleCount(parseInt(cy, 10));
  }, []);

  // SettingsRow helper
  function Row({
    icon,
    iconColor = "#059669",
    iconBg = "rgba(5,150,105,0.1)",
    title,
    subtitle,
    right,
    onClick,
    danger,
  }: {
    icon: React.ReactNode;
    iconColor?: string;
    iconBg?: string;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
  }) {
    return (
      <div
        role={onClick ? "button" : undefined}
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 16px",
          borderBottom: "1px solid var(--border)",
          cursor: onClick ? "pointer" : "default",
          transition: "background 0.1s",
          WebkitTapHighlightColor: "transparent",
        } as React.CSSProperties}
        className={onClick ? "active:bg-black/5 dark:active:bg-white/5" : ""}
      >
        {/* Icon badge */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: danger ? "rgba(239,68,68,0.1)" : iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: danger ? "#EF4444" : iconColor,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: danger ? "#EF4444" : "var(--text)",
            lineHeight: 1.3,
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1, lineHeight: 1.3 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Right side */}
        {right !== undefined ? (
          right
        ) : onClick ? (
          <CaretRight size={16} weight="bold" style={{ color: "var(--muted)", flexShrink: 0 }} />
        ) : null}
      </div>
    );
  }

  // Theme toggle switch
  const ThemeSwitch = (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={dark}
      style={{
        position: "relative",
        width: 48,
        height: 28,
        borderRadius: 14,
        border: "none",
        background: dark ? "#059669" : "#CBD5E1",
        cursor: "pointer",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: dark ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.25s cubic-bezier(0.34,1.4,0.64,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dark ? (
          <Moon size={12} weight="fill" style={{ color: "#059669" }} />
        ) : (
          <Sun size={12} weight="fill" style={{ color: "#D97706" }} />
        )}
      </span>
    </button>
  );

  return (
    <div className="animate-fade-up" style={{ padding: "0 0 24px" }}>

      {/* Hero header */}
      <div
        style={{
          padding: "32px 20px 24px",
          background: dark
            ? "linear-gradient(160deg, #0F172A 0%, #1E293B 100%)"
            : "linear-gradient(160deg, #ECFDF5 0%, #F0FDF4 100%)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bg decoration */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 120, height: 120,
          borderRadius: "50%",
          background: dark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.12)",
          pointerEvents: "none",
        }} />

        {/* Avatar */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "linear-gradient(135deg, #059669, #34D399)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 28 }}>🕌</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>EXTIYOJ</div>
            <SealCheck size={18} weight="fill" style={{ color: "#059669" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            Muslmonlar uchun qulay ilova
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
            background: "rgba(5,150,105,0.1)",
            border: "1px solid rgba(5,150,105,0.2)",
            borderRadius: 8,
            padding: "3px 8px",
            fontSize: 11,
            fontWeight: 700,
            color: "#059669",
          }}>
            v1.0.0
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 0, margin: "16px 16px 0", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
        {[
          { label: "Bugungi tasbeh", value: tasbehCount, icon: <CirclesThree size={16} weight="fill" /> },
          { label: "Tsikllar", value: cycleCount, icon: <CheckCircle size={16} weight="fill" /> },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: "14px 16px",
              textAlign: "center",
              background: "var(--surface)",
              borderRight: i === 0 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: "#059669", marginBottom: 4 }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Appearance section */}
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
          KO&apos;RINISH
        </div>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)" }}>
          <Row
            icon={dark ? <Moon size={18} weight="fill" /> : <Sun size={18} weight="fill" />}
            iconColor={dark ? "#818CF8" : "#D97706"}
            iconBg={dark ? "rgba(129,140,248,0.12)" : "rgba(217,119,6,0.1)"}
            title={dark ? "Tungi rejim yoniq" : "Kunduzgi rejim yoniq"}
            subtitle="Ilova ko'rinishini o'zgartirish"
            right={ThemeSwitch}
          />
          <div style={{ borderBottom: "none" }}>
            <Row
              icon={<MapPin size={18} weight="fill" />}
              iconColor="#0EA5E9"
              iconBg="rgba(14,165,233,0.1)"
              title="Joylashuv"
              subtitle="Yaqin joylarni topish uchun ishlatiladi"
              right={
                <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700, background: "rgba(34,197,94,0.1)", padding: "3px 8px", borderRadius: 6 }}>
                  Yoniq
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* App info section */}
      <div style={{ padding: "4px 16px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
          ILOVA HAQIDA
        </div>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)" }}>
          <Row
            icon={<Bell size={18} weight="fill" />}
            iconColor="#A855F7"
            iconBg="rgba(168,85,247,0.1)"
            title="Namoz eslatmalari"
            subtitle="Tez kunda qo'shiladi"
            right={
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, background: "var(--border)", padding: "3px 8px", borderRadius: 6 }}>
                Tez kunda
              </span>
            }
          />
          <Row
            icon={<Info size={18} weight="fill" />}
            iconColor="#64748B"
            iconBg="rgba(100,116,139,0.1)"
            title="Versiya"
            subtitle="EXTIYOJ v1.0.0 · Muhriddin tomonidan"
            right={<span />}
          />
          <div style={{ borderBottom: "none" }}>
            <Row
              icon={<ArrowRight size={18} weight="bold" />}
              iconColor="#059669"
              iconBg="rgba(5,150,105,0.1)"
              title="Telegram bot"
              subtitle="@ehtiyojBot — kirish va OTP"
              onClick={() => window.open("https://t.me/ehtiyojBot", "_blank")}
            />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ padding: "4px 16px 8px" }}>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ borderBottom: "none" }}>
            <Row
              icon={<Trash size={18} weight="fill" />}
              title="Tasbeh ma'lumotlarini tozalash"
              subtitle="Bugungi son 0 ga qaytadi"
              onClick={() => {
                localStorage.setItem("tasbeh_count", "0");
                localStorage.setItem("tasbeh_cycle", "0");
                setTasbehCount(0);
                setCycleCount(0);
              }}
              danger
            />
          </div>
        </div>
      </div>

    </div>
  );
}
