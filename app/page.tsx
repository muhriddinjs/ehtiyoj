"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BottomNav from "@/components/layout/BottomNav";
import ProfileSheet from "@/components/profile/ProfileSheet";

// ---- Types ----
type Prayer = {
  id: string;
  name: string;
  time: string;
  icon: string;
};

type LeaderEntry = {
  id: number;
  first_name: string;
  username: string;
  sticker: string;
  total_count: number;
  rank: number;
};

type Session = {
  userId: number;
  firstName: string;
  username: string;
  sticker: string;
} | null;

// ---- Qibla yo'nalishi hisoblash ----
function calcQibla(lat: number, lon: number): number {
  const kaabaLat = (21.4225 * Math.PI) / 180;
  const kaabaLon = (39.8262 * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const dLon = kaabaLon - (lon * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(kaabaLat);
  const x =
    Math.cos(userLat) * Math.sin(kaabaLat) -
    Math.sin(userLat) * Math.cos(kaabaLat) * Math.cos(dLon);
  let angle = (Math.atan2(y, x) * 180) / Math.PI;
  return (angle + 360) % 360;
}

const STICKERS = ["🌙", "🕌", "📿", "🕋", "📖", "💎", "⭐", "🌟", "🤲", "🔱"];

export default function QiblaPage() {
  const [session, setSession] = useState<Session>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [currentPrayer, setCurrentPrayer] = useState(0);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [tasbex, setTasbex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [compassDeg, setCompassDeg] = useState(0);
  const [qiblaDeg, setQiblaDeg] = useState(293);
  const [compassError, setCompassError] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [hijriDate, setHijriDate] = useState("");

  const compassRef = useRef<number>(0);
  const needleRef = useRef<SVGGElement>(null);
  const tasbexSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sessiyani olish
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s) {
          setSession(s);
          // Tasbexni DB dan olish
          fetch("/api/tasbex")
            .then((r) => r.json())
            .then((d) => setTasbex(d.count || 0));
          // Leaderboard
          fetch("/api/leaderboard")
            .then((r) => r.json())
            .then((d) => setLeaderboard(d.entries || []));
        }
      });
  }, []);

  // Geolokatsiya va namoz vaqtlari
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setLocation({ lat, lon });
          const qibla = calcQibla(lat, lon);
          setQiblaDeg(qibla);
          // Namoz vaqtlari
          fetch(`/api/prayer-times?lat=${lat}&lon=${lon}`)
            .then((r) => r.json())
            .then((d) => {
              setPrayers(d.prayers || []);
              setCurrentPrayer(d.currentIdx ?? 0);
              if (d.hijri) setHijriDate(d.hijri);
            });
        },
        () => {
          // Default: Toshkent
          fetch("/api/prayer-times?lat=41.2995&lon=69.2401")
            .then((r) => r.json())
            .then((d) => {
              setPrayers(d.prayers || []);
              setCurrentPrayer(d.currentIdx ?? 0);
              if (d.hijri) setHijriDate(d.hijri);
            });
        }
      );
    }
  }, []);

  // Kompas (DeviceOrientation)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const alpha = (e as any).webkitCompassHeading ?? e.alpha ?? 0;
      compassRef.current = alpha;
      if (needleRef.current) {
        const needleAngle = qiblaDeg - alpha;
        needleRef.current.style.transform = `rotate(${needleAngle}deg)`;
      }
      setCompassDeg(Math.round(alpha));
    };

    if (window.DeviceOrientationEvent) {
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        // iOS 13+ permission
        setCompassError(true); // iOS da bosish kerak
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    } else {
      // Fallback — animatsion
      let deg = 293;
      const interval = setInterval(() => {
        deg += (Math.random() - 0.5) * 0.5;
        if (needleRef.current) {
          needleRef.current.style.transform = `rotate(${deg}deg)`;
        }
      }, 2000);
      return () => clearInterval(interval);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [qiblaDeg]);

  // iOS kompas permission
  const requestCompassPermission = async () => {
    try {
      const perm = await (DeviceOrientationEvent as any).requestPermission();
      if (perm === "granted") {
        setCompassError(false);
        window.addEventListener(
          "deviceorientation",
          (e: DeviceOrientationEvent) => {
            const alpha = (e as any).webkitCompassHeading ?? e.alpha ?? 0;
            if (needleRef.current) {
              needleRef.current.style.transform = `rotate(${qiblaDeg - alpha}deg)`;
            }
            setCompassDeg(Math.round(alpha));
          },
          true
        );
      }
    } catch {}
  };

  // Tasbex qo'shish
  const addTasbex = useCallback(() => {
    setTasbex((prev) => {
      const next = prev + 1;
      // Debounced saqlash
      clearTimeout(tasbexSaveTimer.current);
      tasbexSaveTimer.current = setTimeout(() => {
        if (session) {
          fetch("/api/tasbex", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: next }),
          });
        }
      }, 1500);
      return next;
    });
  }, [session]);

  const resetTasbex = () => {
    setTasbex(0);
    if (session) {
      fetch("/api/tasbex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 0 }),
      });
    }
  };

  const myRank = leaderboard.find((e) => e.id === session?.userId);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Stars background */}
      <div className="stars-bg" />

      {/* Top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(4, 13, 31, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(56,189,248,0.06)",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => setProfileOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(56,189,248,0.12)",
              border: "2px solid rgba(56,189,248,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              transition: "all 0.2s",
            }}
          >
            {session?.sticker || "🌙"}
          </div>
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 1 }}>
            Qibla yo'nalishi
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              background: "linear-gradient(135deg, #38BDF8, #7DD3FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {Math.round(qiblaDeg)}° NW
          </div>
        </div>

        <button
          onClick={() => setPrayerOpen((p) => !p)}
          style={{
            background: prayerOpen
              ? "rgba(56,189,248,0.2)"
              : "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 12,
            width: 40,
            height: 40,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          🕐
        </button>
      </header>

      <div style={{ padding: "0 0 88px" }}>
        {/* Prayer times panel */}
        {prayerOpen && (
          <div
            className="card page-enter"
            style={{ margin: "12px 16px", padding: "14px 16px" }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 600 }}>Bugungi namoz vaqtlari</span>
              {hijriDate && (
                <span
                  style={{
                    color: "var(--primary)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {hijriDate} H
                </span>
              )}
            </div>
            {prayers.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom:
                    i < prayers.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: i === currentPrayer ? 700 : 400,
                      color:
                        i === currentPrayer ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {p.name}
                  </span>
                  {i === currentPrayer && (
                    <span
                      style={{
                        background: "rgba(56,189,248,0.15)",
                        color: "var(--primary)",
                        fontSize: 10,
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontWeight: 700,
                      }}
                    >
                      Hozir
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: i === currentPrayer ? "var(--primary)" : "var(--text)",
                  }}
                >
                  {p.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* COMPASS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 0 8px",
          }}
        >
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            style={{ filter: "drop-shadow(0 0 24px rgba(56,189,248,0.15))" }}
          >
            {/* Outer ring */}
            <circle
              cx="120"
              cy="120"
              r="114"
              fill="none"
              stroke="rgba(56,189,248,0.08)"
              strokeWidth="1"
            />
            <circle
              cx="120"
              cy="120"
              r="108"
              fill="rgba(7,20,40,0.9)"
              stroke="rgba(56,189,248,0.15)"
              strokeWidth="1.5"
            />

            {/* Glow ring */}
            <circle
              cx="120"
              cy="120"
              r="108"
              fill="none"
              stroke="url(#compassGlow)"
              strokeWidth="2"
              opacity="0.5"
            />

            <defs>
              <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Degree ticks */}
            {Array.from({ length: 72 }, (_, i) => {
              const angle = (i * 5 * Math.PI) / 180;
              const isMajor = i % 9 === 0;
              const r1 = isMajor ? 92 : 98;
              const r2 = 106;
              return (
                <line
                  key={i}
                  x1={120 + r1 * Math.cos(angle - Math.PI / 2)}
                  y1={120 + r1 * Math.sin(angle - Math.PI / 2)}
                  x2={120 + r2 * Math.cos(angle - Math.PI / 2)}
                  y2={120 + r2 * Math.sin(angle - Math.PI / 2)}
                  stroke={isMajor ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.1)"}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                />
              );
            })}

            {/* Cardinal directions */}
            <text x="120" y="30" textAnchor="middle" dominantBaseline="middle"
              fill="#38BDF8" fontSize="14" fontWeight="800" fontFamily="Plus Jakarta Sans">N</text>
            <text x="210" y="122" textAnchor="middle" dominantBaseline="middle"
              fill="rgba(100,116,139,0.8)" fontSize="12" fontWeight="600" fontFamily="Plus Jakarta Sans">E</text>
            <text x="120" y="214" textAnchor="middle" dominantBaseline="middle"
              fill="rgba(100,116,139,0.8)" fontSize="12" fontWeight="600" fontFamily="Plus Jakarta Sans">S</text>
            <text x="30" y="122" textAnchor="middle" dominantBaseline="middle"
              fill="rgba(100,116,139,0.8)" fontSize="12" fontWeight="600" fontFamily="Plus Jakarta Sans">W</text>

            {/* Needle */}
            <g
              ref={needleRef}
              style={{
                transformOrigin: "120px 120px",
                transition: "transform 0.8s cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              {/* North (Qibla direction) */}
              <polygon
                points="120,32 114,120 120,96 126,120"
                fill="url(#needleGrad)"
                filter="url(#needleGlow)"
              />
              {/* South */}
              <polygon
                points="120,208 114,120 120,144 126,120"
                fill="rgba(30,41,59,0.8)"
              />
              {/* Center dot */}
              <circle cx="120" cy="120" r="10"
                fill="var(--surface-2)"
                stroke="rgba(56,189,248,0.4)"
                strokeWidth="1.5"
              />
              <circle cx="120" cy="120" r="4" fill="#38BDF8" />

              <defs>
                <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <filter id="needleGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </g>

            {/* Kaaba icon */}
            <text x="120" y="123" textAnchor="middle" dominantBaseline="middle"
              fontSize="14">🕋</text>
          </svg>

          {compassError && (
            <button
              onClick={requestCompassPermission}
              className="btn-primary"
              style={{ width: "auto", padding: "10px 24px", marginTop: 12, fontSize: 13 }}
            >
              🧭 Kompasga ruxsat berish
            </button>
          )}
        </div>

        {/* TASBEX */}
        <div className="card" style={{ margin: "8px 16px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Tasbex</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>SubhanAlloh · AlhamdulilLoh · AllohuAkbar</div>
            </div>
            <span
              style={{
                background: "rgba(56,189,248,0.1)",
                color: "var(--primary)",
                fontSize: 11,
                borderRadius: 8,
                padding: "4px 10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Zikrlar
            </span>
          </div>

          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1,
                background: "linear-gradient(135deg, #38BDF8, #7DD3FC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 4,
              }}
            >
              {tasbex.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
              {tasbex % 100 === 0 && tasbex > 0 ? "🎉 " + tasbex + " ga yetdi!" : "Tasbex soni"}
            </div>

            {/* Main button */}
            <button
              onClick={addTasbex}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                border: "none",
                cursor: "pointer",
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 4px 24px rgba(56,189,248,0.4)",
                transition: "all 0.15s",
                fontFamily: "inherit",
                position: "relative",
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onTouchStart={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)";
              }}
              onTouchEnd={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              +1
            </button>

            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
              <button
                onClick={resetTasbex}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--muted)",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 20 }}>🔄</span>
                Qayta boshlash
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--muted)",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 20 }}>📿</span>
                Zikrlar
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--muted)",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 20 }}>🏆</span>
                Reyting
              </button>
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="card" style={{ margin: "0 16px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>🏆 Top 10 Reyting</div>
            <span style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Barchasi →
            </span>
          </div>

          {leaderboard.length === 0 ? (
            // Skeleton
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                <div className="shimmer" style={{ width: 28, height: 16, borderRadius: 4 }} />
                <div className="shimmer" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                <div className="shimmer" style={{ width: 100, height: 14, borderRadius: 4 }} />
                <div className="shimmer" style={{ width: 50, height: 14, borderRadius: 4, marginLeft: "auto" }} />
              </div>
            ))
          ) : (
            <>
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: i < 3 ? 18 : 13, width: 24, textAlign: "center", color: "var(--muted)" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(56,189,248,0.1)",
                      border: "1px solid rgba(56,189,248,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      {entry.sticker}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: entry.id === session?.userId ? 700 : 400 }}>
                      {entry.first_name}
                    </span>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: 13,
                    color: i < 3 ? "var(--gold)" : "var(--text)",
                  }}>
                    {entry.total_count.toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Mening o'rnim */}
              {session && myRank && myRank.rank > 10 && (
                <div className="leaderboard-me" style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "var(--muted)", width: 24, textAlign: "center" }}>
                        {myRank.rank}
                      </span>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(56,189,248,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {session.sticker}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>Siz</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "var(--primary)" }}>
                      {tasbex.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {!session && (
                <div style={{
                  textAlign: "center", padding: "12px 0",
                  color: "var(--muted)", fontSize: 13
                }}>
                  Reytingda ko'rinish uchun{" "}
                  <a href="/auth" style={{ color: "var(--primary)", fontWeight: 600 }}>kiring</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Profile Sheet */}
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        session={session}
        tasbex={tasbex}
      />
    </div>
  );
}
