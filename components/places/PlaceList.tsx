"use client";

import {
  Toilet,
  MagnifyingGlass,
  MapPin,
  NavigationArrow,
} from "@phosphor-icons/react";

// Custom Mosque SVG icon — re-export for PlaceList
function MosqueIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" style={style}>
      <path d="M128 24C104 24 80 56 80 80V96H48V80a8 8 0 0 0-16 0v16H24a8 8 0 0 0-8 8v96a8 8 0 0 0 8 8h80v-40a24 24 0 0 1 48 0v40h80a8 8 0 0 0 8-8V104a8 8 0 0 0-8-8h-8V80a8 8 0 0 0-16 0v16h-32V80c0-24-24-56-48-56Z" fill="currentColor"/>
      <path d="M128 24c-24 0-48 32-48 56h96c0-24-24-56-48-56Z" fill="currentColor" opacity="0.85"/>
      <rect x="36" y="56" width="12" height="40" rx="4" fill="currentColor"/>
      <circle cx="42" cy="50" r="6" fill="currentColor"/>
      <rect x="208" y="56" width="12" height="40" rx="4" fill="currentColor"/>
      <circle cx="214" cy="50" r="6" fill="currentColor"/>
    </svg>
  );
}

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

type Props = {
  places: Place[];
  loading: boolean;
  type: "masjid" | "hojatxona";
  nearest?: number;
  onPlaceClick?: (place: Place) => void;
  onNavigate?: (place: Place) => void;
};

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  "5 mahal": { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  Masjid: { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  Juma: { bg: "rgba(139,92,246,0.12)", color: "#A78BFA" },
  "Tahorat bor": { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  Tekin: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  Pullik: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  Ochiq: { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  Zamonaviy: { bg: "rgba(168,85,247,0.12)", color: "#A855F7" },
};

function distLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function PlaceList({ places, loading, type, nearest, onPlaceClick, onNavigate }: Props) {
  const isMasjid = type === "masjid";
  const accentColor = isMasjid ? "#34D399" : "#38BDF8";
  const gradientFrom = isMasjid ? "#059669" : "#0EA5E9";
  const gradientTo = isMasjid ? "#34D399" : "#38BDF8";

  if (loading) {
    return (
      <div>
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div className="shimmer" style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="shimmer" style={{ width: "60%", height: 14, borderRadius: 4, marginBottom: 8 }} />
              <div className="shimmer" style={{ width: "40%", height: 11, borderRadius: 4 }} />
            </div>
            <div className="shimmer" style={{ width: 48, height: 38, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 0",
          color: "var(--muted)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <MagnifyingGlass size={24} weight="duotone" style={{ color: "var(--muted)" }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Hech narsa topilmadi
        </div>
        <div style={{ fontSize: 13 }}>Qidiruv yoki filtrni o&apos;zgartiring</div>
      </div>
    );
  }

  return (
    <div>
      {places.map((place, idx) => {
        const isNearest = place.id === nearest;
        return (
          <div
            key={place.id}
            className="card card-hover"
            onClick={() => onPlaceClick?.(place)}
            style={{
              marginBottom: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              cursor: "pointer",
              ...(isNearest
                ? {
                    background: `${accentColor}08`,
                    borderColor: `${accentColor}40`,
                  }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              {/* Icon */}
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: `linear-gradient(135deg, ${gradientFrom}18, ${gradientTo}12)`,
                  border: `1px solid ${accentColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                  color: accentColor,
                }}
              >
                {isMasjid ? (
                  <MosqueIcon size={22} />
                ) : (
                  <Toilet size={22} weight="duotone" />
                )}
                {idx === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 800,
                      color: "#fff",
                      boxShadow: `0 2px 6px ${accentColor}40`,
                    }}
                  >
                    1
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 5,
                    color: isNearest ? "var(--primary)" : "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {place.name}
                  {isNearest && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        background: `${accentColor}20`,
                        color: "var(--primary)",
                        borderRadius: 5,
                        padding: "1px 6px",
                        fontWeight: 700,
                      }}
                    >
                      Eng yaqin
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {place.tags.map((tag) => {
                    const c = TAG_COLORS[tag] || { bg: "rgba(100,116,139,0.12)", color: "#64748B" };
                    return (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 5,
                          fontWeight: 600,
                          background: c.bg,
                          color: c.color,
                        }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Distance */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <MapPin size={12} weight="fill" style={{ color: accentColor }} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: accentColor,
                  }}
                >
                  {distLabel(place.distM)}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                {place.address || "Yaqin atrofda"}
              </div>
              {/* Yo'nalish tugmasi */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(place);
                }}
                style={{
                  marginTop: 6,
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${accentColor}40`,
                  background: `${accentColor}10`,
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                <NavigationArrow size={12} weight="fill" />
                Yo&apos;nalish
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
