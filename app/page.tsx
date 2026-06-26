"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Toilet,
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
  Plus,
  X,
  PaperPlaneTilt,
  CheckCircle,
  NavigationArrow,
  Car,
  PersonSimpleWalk,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import PlaceList from "@/components/places/PlaceList";
import type { RouteInfo } from "@/components/places/YandexMap";

// Custom Mosque SVG icon — Phosphor da Mosque yo'q
function MosqueIcon({ size = 24, weight = "regular", style }: { size?: number; weight?: string; style?: React.CSSProperties }) {
  const isFill = weight === "fill" || weight === "duotone";
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" style={style}>
      {isFill ? (
        <>
          {/* Filled mosque */}
          <path d="M128 24C104 24 80 56 80 80V96H48V80a8 8 0 0 0-16 0v16H24a8 8 0 0 0-8 8v96a8 8 0 0 0 8 8h80v-40a24 24 0 0 1 48 0v40h80a8 8 0 0 0 8-8V104a8 8 0 0 0-8-8h-8V80a8 8 0 0 0-16 0v16h-32V80c0-24-24-56-48-56Z" fill="currentColor"/>
          {/* Dome */}
          <path d="M128 24c-24 0-48 32-48 56h96c0-24-24-56-48-56Z" fill="currentColor" opacity="0.85"/>
          {/* Minaret left */}
          <rect x="36" y="56" width="12" height="40" rx="4" fill="currentColor"/>
          <circle cx="42" cy="50" r="6" fill="currentColor"/>
          {/* Minaret right */}
          <rect x="208" y="56" width="12" height="40" rx="4" fill="currentColor"/>
          <circle cx="214" cy="50" r="6" fill="currentColor"/>
          {/* Crescent */}
          <path d="M132 32a10 10 0 1 1-8 16 12 12 0 0 0 8-16Z" fill="currentColor" opacity="0.7"/>
        </>
      ) : (
        <>
          {/* Outlined mosque */}
          <path d="M128 28c-20 0-44 28-44 52v16H48V80a8 8 0 0 0-16 0v16H24a8 8 0 0 0-8 8v92a8 8 0 0 0 8 8h80v-36a24 24 0 0 1 48 0v36h80a8 8 0 0 0 8-8V104a8 8 0 0 0-8-8h-8V80a8 8 0 0 0-16 0v16h-36V80c0-24-24-52-44-52Z" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Minaret left */}
          <rect x="37" y="58" width="10" height="38" rx="3" stroke="currentColor" strokeWidth="8"/>
          <circle cx="42" cy="50" r="5" stroke="currentColor" strokeWidth="6"/>
          {/* Minaret right */}
          <rect x="209" y="58" width="10" height="38" rx="3" stroke="currentColor" strokeWidth="8"/>
          <circle cx="214" cy="50" r="5" stroke="currentColor" strokeWidth="6"/>
        </>
      )}
    </svg>
  );
}

// Yandex Map ni client-side dynamic import
const YandexMap = dynamic(() => import("@/components/places/YandexMap"), {
  ssr: false,
  loading: () => (
    <div
      className="shimmer"
      style={{ height: "55vh", borderRadius: 20, border: "1px solid var(--border)" }}
    />
  ),
});

// ============================================================
// Types
// ============================================================
type Tab = "hojatxona" | "masjid" | "profil";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distM: number;
  tags: string[];
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
};

// ============================================================
// Main App Shell
// ============================================================
export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("hojatxona");
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
        {activeTab === "hojatxona" && <MapScreen type="hojatxona" />}
        {activeTab === "masjid" && <MapScreen type="masjid" />}
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
  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode; color: string }[] = [
    {
      id: "hojatxona",
      label: "Zarurat",
      color: "#0EA5E9",
      icon: (active) => (
        <Toilet
          size={24}
          weight={active ? "fill" : "regular"}
        />
      ),
    },
    {
      id: "masjid",
      label: "Masjidlar",
      color: "#059669",
      icon: (active) => (
        <MosqueIcon
          size={24}
          weight={active ? "fill" : "regular"}
        />
      ),
    },
    {
      id: "profil",
      label: "Profil",
      color: "#059669",
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
          const activeColor = tab.color;
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
                color: isActive ? activeColor : "var(--muted)",
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
                    background: activeColor,
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
// Shared Map Screen — type parametriga qarab masjid yoki hojatxona
// ============================================================
function MapScreen({ type }: { type: "masjid" | "hojatxona" }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locationError, setLocationError] = useState("");
  const [source, setSource] = useState<"osm" | "fallback" | "">("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pickedLat, setPickedLat] = useState<number | null>(null);
  const [pickedLon, setPickedLon] = useState<number | null>(null);
  const [navigateTarget, setNavigateTarget] = useState<Place | null>(null);

  const handlePick = useCallback((pLat: number, pLon: number) => {
    setPickedLat(pLat);
    setPickedLon(pLon);
    setPickingLocation(false);
    setShowSuggest(true);
  }, []);
  const [routeMode, setRouteMode] = useState<"auto" | "pedestrian">("pedestrian");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const isHojatxona = type === "hojatxona";
  const accentColor = isHojatxona ? "#0EA5E9" : "#059669";
  const title = isHojatxona ? "Yaqin zaruratxonalar" : "Yaqin masjidlar";

  const fetchPlaces = useCallback(
    async (lat: number, lon: number, placeType: string) => {
      setLoading(true);
      setPlaces([]);
      setSelectedPlace(null);
      try {
        const res = await fetch(
          `/api/places?lat=${lat}&lon=${lon}&type=${placeType}`
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
      setLocationError("Geolokatsiya qo\u2018llab-quvvatlanmaydi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        fetchPlaces(latitude, longitude, type);
      },
      () => {
        setLocationError("Joylashuv aniqlanmadi. Toshkent markazi ishlatilmoqda.");
        const lat = 41.2995;
        const lon = 69.2401;
        setUserLat(lat);
        setUserLon(lon);
        fetchPlaces(lat, lon, type);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [fetchPlaces, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearest = places.length > 0 ? places[0].id : undefined;

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column" }}>
      {/* Map — katta, ekranining yuqori yarmi */}
      <div style={{ position: "relative" }}>
        {userLat && userLon ? (
          <YandexMap
            lat={userLat}
            lon={userLon}
            places={places}
            type={type}
            nearest={nearest}
            selectedPlace={selectedPlace}
            navigateTo={navigateTarget}
            routeMode={routeMode}
            onRouteReady={setRouteInfo}
            pickMode={pickingLocation}
            onPick={handlePick}
            height="55vh"
          />
        ) : (
          <div
            className="shimmer"
            style={{ height: "55vh", borderRadius: 0, border: "none" }}
          />
        )}

        {/* Overlay: Location error */}
        {locationError && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              background: "rgba(251,191,36,0.95)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              color: "#78350F",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          >
            <MapPin size={15} weight="fill" style={{ flexShrink: 0 }} />
            {locationError}
          </div>
        )}

        {/* Overlay: Refresh button */}
        <button
          onClick={getLocation}
          disabled={loading}
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 14px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            fontFamily: "inherit",
            opacity: loading ? 0.5 : 1,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            zIndex: 10,
          }}
        >
          <ArrowsClockwise
            size={15}
            weight="bold"
            style={loading ? { animation: "spin 1s linear infinite" } : {}}
          />
          Yangilash
        </button>

        {/* Fallback indicator */}
        {source === "fallback" && (
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              background: "rgba(0,0,0,0.7)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11,
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              gap: 5,
              zIndex: 10,
            }}
          >
            <WifiSlash size={12} weight="bold" />
            Offline
          </div>
        )}

        {/* Yo'nalish info paneli */}
        {navigateTarget && routeInfo && (
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              right: 14,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "12px 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `${accentColor}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accentColor,
                flexShrink: 0,
              }}
            >
              <NavigationArrow size={20} weight="fill" />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {routeInfo.placeName}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {routeInfo.lengthM < 1000
                  ? `${routeInfo.lengthM} m`
                  : `${(routeInfo.lengthM / 1000).toFixed(1)} km`}
                {" • ~"}{routeInfo.timeMin} min
                {" • "}{routeInfo.mode === "auto" ? "Mashina" : "Piyoda"}
              </div>
            </div>

            {/* Transport mode toggle */}
            <div
              style={{
                display: "flex",
                borderRadius: 10,
                border: "1px solid var(--border)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setRouteMode("pedestrian")}
                style={{
                  padding: "6px 10px",
                  border: "none",
                  background: routeMode === "pedestrian" ? `${accentColor}20` : "transparent",
                  color: routeMode === "pedestrian" ? accentColor : "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                aria-label="Piyoda"
              >
                <PersonSimpleWalk size={16} weight="bold" />
              </button>
              <button
                onClick={() => setRouteMode("auto")}
                style={{
                  padding: "6px 10px",
                  border: "none",
                  borderLeft: "1px solid var(--border)",
                  background: routeMode === "auto" ? `${accentColor}20` : "transparent",
                  color: routeMode === "auto" ? accentColor : "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                aria-label="Mashina"
              >
                <Car size={16} weight="bold" />
              </button>
            </div>

            {/* Yopish tugmasi */}
            <button
              onClick={() => {
                setNavigateTarget(null);
                setRouteInfo(null);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: "var(--border)",
                color: "var(--muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Yo'nalishni bekor qilish"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Content area — header + list */}
      <div style={{ padding: "16px 16px 0" }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${accentColor}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accentColor,
              }}
            >
              {isHojatxona ? <Toilet size={20} weight="duotone" /> : <MosqueIcon size={20} weight="fill" />}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                {title}
              </h1>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {loading ? "Qidirilmoqda..." : `${places.length} ta joy topildi`}
              </div>
            </div>
          </div>
        </div>

        <PlaceList
          places={places}
          loading={loading}
          type={type}
          nearest={nearest}
          onPlaceClick={setSelectedPlace}
          onNavigate={(place) => {
            setNavigateTarget(place);
            setRouteInfo(null);
          }}
        />
      </div>

      {/* Pick mode banner */}
      {pickingLocation && (
        <div style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          background: "#0EA5E9",
          color: "white",
          borderRadius: 14,
          padding: "10px 18px",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 4px 20px rgba(14,165,233,0.4)",
          maxWidth: "calc(100vw - 32px)",
          pointerEvents: "auto",
        }}>
          <MapPin size={16} weight="fill" />
          Xaritada joyni bosing
          <button
            onClick={() => { setPickingLocation(false); setPickedLat(null); setPickedLon(null); setShowSuggest(true); }}
            style={{ background: "white", border: "none", borderRadius: 8, padding: "4px 10px", color: "#0EA5E9", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
          >
            Bekor
          </button>
        </div>
      )}

      {/* FAB — Hojatxona qo'shish (faqat hojatxona tabida) */}
      {isHojatxona && (
        <button
          onClick={() => { setPickedLat(null); setPickedLon(null); setShowSuggest(true); }}
          style={{
            position: "fixed",
            bottom: 84,
            right: "max(16px, calc(50% - 199px))",
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
            boxShadow: "0 6px 24px rgba(14,165,233,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: 40,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          aria-label="Zarurat qo'shish"
        >
          <Plus size={24} weight="bold" />
        </button>
      )}

      {/* Suggest Modal */}
      {showSuggest && (
        <SuggestModal
          lat={pickedLat ?? userLat}
          lon={pickedLon ?? userLon}
          isPicked={pickedLat !== null}
          onPickFromMap={() => { setShowSuggest(false); setPickingLocation(true); }}
          onClose={() => { setShowSuggest(false); setPickedLat(null); setPickedLon(null); }}
        />
      )}
    </div>
  );
}

// ============================================================
// Suggest Modal — Yangi hojatxona taklifi
// ============================================================
function SuggestModal({
  lat,
  lon,
  isPicked,
  onPickFromMap,
  onClose,
}: {
  lat: number | null;
  lon: number | null;
  isPicked?: boolean;
  onPickFromMap?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          note: note.trim(),
          lat,
          lon,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Server xatoligi");
      setSent(true);
    } catch {
      setError("Yuborishda xatolik. Qayta urinib ko\u2018ring.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        className="animate-slide-up"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 430,
          background: "var(--surface)",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
          border: "1px solid var(--border)",
          borderBottom: "none",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 20px" }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "var(--border)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted)",
          }}
        >
          <X size={16} weight="bold" />
        </button>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #059669, #34D399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 24px rgba(5,150,105,0.3)",
              }}
            >
              <CheckCircle size={32} weight="fill" style={{ color: "white" }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Rahmat!</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              Taklifingiz qabul qilindi. Tekshiruvdan o&apos;tgach xaritaga qo&apos;shiladi.
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: 20, maxWidth: 200, marginLeft: "auto", marginRight: "auto" }}
            >
              Yopish
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "rgba(14,165,233,0.12)",
                  border: "1px solid rgba(14,165,233,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0EA5E9",
                  flexShrink: 0,
                }}
              >
                <Plus size={22} weight="bold" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Zarurat qo&apos;shish</h3>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>Yangi joyni xaritaga taklif qiling</p>
              </div>
            </div>

            {/* Name */}
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Nomi *
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Mega Planet WC"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#0EA5E9"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </label>

            {/* Location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(14,165,233,0.06)",
                border: "1px solid rgba(14,165,233,0.15)",
                marginBottom: 14,
                fontSize: 13,
                color: "var(--text)",
              }}
            >
              <NavigationArrow size={16} weight="fill" style={{ color: "#0EA5E9", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>
                {lat && lon
                  ? `${isPicked ? "Xaritada tanlangan" : "Joriy joylashuv"}: ${lat.toFixed(4)}, ${lon.toFixed(4)}`
                  : "Joylashuv aniqlanmadi"}
              </span>
              {onPickFromMap && (
                <button
                  type="button"
                  onClick={onPickFromMap}
                  style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 8, padding: "4px 10px", color: "#0EA5E9", cursor: "pointer", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Xaritada belgilash
                </button>
              )}
            </div>

            {/* Note */}
            <label style={{ display: "block", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Izoh (ixtiyoriy)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masalan: Metro bekatining ichida, 2-qavat"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#0EA5E9"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </label>

            {error && (
              <div
                style={{
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.2)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#FB7185",
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim() || sending}
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <PaperPlaneTilt size={18} weight="fill" />
              {sending ? "Yuborilmoqda..." : "Taklif yuborish"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Screen: Profil
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
}: {
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick?: () => void;
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
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
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
          color: "white",
        }}>
          <MosqueIcon size={32} weight="fill" />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>EHTIYOJ</div>
            <SealCheck size={18} weight="fill" style={{ color: "#059669" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            Yaqin joylarni topish uchun ilova
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
            v2.0.0
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
            subtitle="EHTIYOJ v2.0.0 · Muhriddin tomonidan"
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
