"use client";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distM: number;
  tags: string[];
  address: string;
};

type Props = {
  places: Place[];
  loading: boolean;
  type: "masjid" | "hojatxona";
  nearest?: number;
  onPlaceClick?: (place: Place) => void;
};

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  "5 mahal": { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  Masjid: { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  Juma: { bg: "rgba(139,92,246,0.12)", color: "#A78BFA" },
  "Tahorat bor": { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  Tekin: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  Pullik: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  Ochiq: { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
};

function distLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function PlaceList({ places, loading, type, nearest, onPlaceClick }: Props) {
  const icon = type === "masjid" ? "🕌" : "🚻";
  const accentColor = type === "masjid" ? "#34D399" : "#38BDF8";

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
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Hech narsa topilmadi
        </div>
        <div style={{ fontSize: 13 }}>Qidiruv yoki filtrni o&apos;zgartiring</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
        {places.length} ta joy topildi
      </div>
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
                    background: "rgba(56,189,248,0.05)",
                    borderColor: "rgba(56,189,248,0.25)",
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
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {icon}
                {idx === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 800,
                      color: "#000",
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
                        background: "rgba(56,189,248,0.15)",
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
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: accentColor,
                  marginBottom: 2,
                }}
              >
                {distLabel(place.distM)}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {place.address || "Yaqin atrofda"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
