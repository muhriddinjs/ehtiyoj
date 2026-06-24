"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapTrifold,
  UserCircle,
  ArrowsClockwise,
  MapPin,
  WifiSlash,
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
type Tab = "xarita" | "profil";
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


// ============================================================
// Main App Shell
// ============================================================
export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("xarita");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const [placeType, setPlaceType] = useState<PlaceType>("hojatxona");
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userLat && userLon) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        {(["hojatxona", "masjid"] as PlaceType[]).map((t) => (
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
// Screen: Profil — to'liq qayta yozildi
// ============================================================

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

function ProfilScreen({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
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

      </div>
  );
}
