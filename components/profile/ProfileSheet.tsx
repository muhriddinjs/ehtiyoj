"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  userId: number;
  firstName: string;
  username: string;
  sticker: string;
} | null;

type Props = {
  open: boolean;
  onClose: () => void;
  session: Session;
  tasbex: number;
};

const STICKERS = ["🌙", "🕌", "📿", "🕋", "📖", "💎", "⭐", "🌟", "🤲", "🔱"];
const LANGUAGES = ["O'zbekcha", "Русский", "English"];

export default function ProfileSheet({ open, onClose, session, tasbex }: Props) {
  const router = useRouter();
  const [sub, setSub] = useState<string | null>(null);
  const [sticker, setSticker] = useState(session?.sticker || "🌙");
  const [showStickers, setShowStickers] = useState(false);
  const [name, setName] = useState(session?.firstName || "Foydalanuvchi");
  const [nameSaved, setNameSaved] = useState(false);
  const [language, setLanguage] = useState("O'zbekcha");
  const [fbText, setFbText] = useState("");
  const [fbDone, setFbDone] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!open) return null;

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    onClose();
    router.push("/");
  };

  const saveName = () => {
    if (name.trim()) {
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
    setSub(null);
  };

  const sendFeedback = () => {
    if (fbText.trim().length < 3) return;
    setFbDone(true);
    setFbText("");
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />

        {/* Main profile view */}
        {!sub && (
          <div className="page-enter">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>Profil</span>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>

            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "rgba(56,189,248,0.1)",
                    border: "2.5px solid rgba(56,189,248,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 38, margin: "0 auto 8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowStickers((s) => !s)}
                >
                  {sticker}
                </div>
                <button
                  onClick={() => setShowStickers((s) => !s)}
                  style={{
                    position: "absolute", bottom: 8, right: -4,
                    width: 24, height: 24, borderRadius: "50%",
                    background: "var(--primary)", border: "none",
                    color: "#fff", fontSize: 12, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✏</button>
              </div>

              {/* Sticker picker */}
              {showStickers && (
                <div className="page-enter" style={{
                  display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 8, background: "var(--surface-2)",
                  borderRadius: 14, padding: 12, marginBottom: 12,
                }}>
                  {STICKERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSticker(s); setShowStickers(false); }}
                      style={{
                        background: s === sticker ? "rgba(56,189,248,0.2)" : "none",
                        border: s === sticker ? "2px solid rgba(56,189,248,0.4)" : "2px solid transparent",
                        borderRadius: 10, fontSize: 24, cursor: "pointer",
                        padding: 6, transition: "all 0.15s",
                      }}
                    >{s}</button>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {session ? session.firstName : "Mehmon"}
              </div>
              {session?.username && (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>@{session.username}</div>
              )}
            </div>

            {/* Stats */}
            {session && (
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 10, marginBottom: 16,
              }}>
                <div style={{
                  background: "var(--surface-2)", borderRadius: 14,
                  padding: "12px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
                    {tasbex.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Bugungi tasbex</div>
                </div>
                <div style={{
                  background: "var(--surface-2)", borderRadius: 14,
                  padding: "12px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--gold)" }}>
                    #{Math.floor(Math.random() * 50) + 1}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Reyting o'rni</div>
                </div>
              </div>
            )}

            {/* Menu items */}
            {[
              session && { icon: "👤", label: "Ism tahrirlash", sub: "en", value: session.firstName },
              { icon: "🌐", label: "Til / Language", sub: "lg", value: language },
              { icon: "🔔", label: "Namoz eslatmalari", sub: "nt", value: "6 ta yoqilgan" },
              { icon: "ℹ️", label: "Ilova haqida", sub: "ab", value: null },
              { icon: "💬", label: "Fikr bildirish", sub: "fb", value: null },
            ].filter(Boolean).map((item: any) => (
              <div
                key={item.sub}
                onClick={() => setSub(item.sub)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.value && <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.value}</span>}
                  <span style={{ color: "var(--muted)", fontSize: 18 }}>›</span>
                </div>
              </div>
            ))}

            {/* Logout / Login */}
            {session ? (
              <button
                className="btn-outline"
                onClick={logout}
                disabled={loggingOut}
                style={{ marginTop: 20, color: "var(--rose)", borderColor: "rgba(244,63,94,0.3)" }}
              >
                {loggingOut ? "Chiqilmoqda..." : "Chiqish"}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => { onClose(); router.push("/auth"); }}
                style={{ marginTop: 20 }}
              >
                Telegram orqali kirish
              </button>
            )}

            <div style={{ textAlign: "center", fontSize: 11, color: "#2a3a50", marginTop: 14 }}>
              EXTIYOJ v1.0.0
            </div>
          </div>
        )}

        {/* Sub: Edit name */}
        {sub === "en" && (
          <div className="page-enter">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => setSub(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>← Orqaga</button>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Ismni tahrirlash</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Ism Familiya</div>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ismingizni kiriting" style={{ marginBottom: 16 }} />
            <button className="btn-primary" onClick={saveName}>{nameSaved ? "✓ Saqlandi!" : "Saqlash"}</button>
            <button className="btn-outline" onClick={() => setSub(null)} style={{ marginTop: 10 }}>Bekor qilish</button>
          </div>
        )}

        {/* Sub: Language */}
        {sub === "lg" && (
          <div className="page-enter">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => setSub(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Orqaga</button>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Til tanlash</div>
            {LANGUAGES.map((lang) => (
              <div key={lang} onClick={() => { setLanguage(lang); setSub(null); }}
                style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: 15 }}>{lang}</span>
                {lang === language && <span style={{ color: "var(--primary)", fontSize: 18 }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* Sub: About */}
        {sub === "ab" && (
          <div className="page-enter">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => setSub(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Orqaga</button>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🕌</div>
              <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, #38BDF8, #7DD3FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>EXTIYOJ</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>v1.0.0</div>
              <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 2, textAlign: "left" }}>
                🧭 Real kompas bilan Qibla yo'nalishi<br />
                📿 Tasbex hisoblagich va reyting<br />
                🚻 Yaqin hojatxonalar xaritada<br />
                🕌 Yaqin masjidlar va namoz vaqti<br />
                🌐 Ko'p tillilik va Telegram kirish
              </div>
            </div>
          </div>
        )}

        {/* Sub: Feedback */}
        {sub === "fb" && (
          <div className="page-enter">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => setSub(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Orqaga</button>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Fikr bildirish</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Ilovani yaxshilash uchun fikringiz</div>
            {!fbDone ? (
              <>
                <textarea className="input-field" value={fbText} onChange={(e) => setFbText(e.target.value)}
                  placeholder="Fikr, taklif yoki xatolik..."
                  style={{ height: 120, resize: "none", marginBottom: 14 }} />
                <button className="btn-primary" onClick={sendFeedback} disabled={fbText.trim().length < 3}>Yuborish</button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Rahmat!</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Fikringiz qabul qilindi</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
