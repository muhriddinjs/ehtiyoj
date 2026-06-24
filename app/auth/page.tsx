"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from") || "/";
  const from = rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : "/";

  const [step, setStep] = useState<"intro" | "otp" | "success">("intro");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "extiyoj_bot";

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const openBot = () => {
    setStep("otp");
    setCountdown(300); // 5 daqiqa
    window.open(`https://t.me/${botUsername}`, "_blank");
  };

  const handleCodeInput = (val: string, idx: number) => {
    const onlyNum = val.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[idx] = onlyNum;
    setCode(newCode);
    setError("");

    // Keyingi input ga o'tish
    if (onlyNum && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }

    // Avtomatik tekshirish
    if (newCode.every((d) => d !== "") && onlyNum) {
      verifyCode(newCode.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
        setTimeout(() => {
          window.location.href = from;
        }, 1500);
      } else {
        setError(data.error || "Noto'g'ri kod. Qayta urinib ko'ring.");
        setCode(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      }
    } catch {
      setError("Tarmoq xatoligi. Internet aloqasini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="stars-bg" />

      {/* INTRO STEP */}
      {step === "intro" && (
        <div
          className="page-enter"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
            width: "100%",
            gap: 0,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 28,
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.1))",
              border: "1.5px solid rgba(56,189,248,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              marginBottom: 28,
              boxShadow: "0 8px 40px rgba(56,189,248,0.2)",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🕌
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              background: "linear-gradient(135deg, #38BDF8, #7DD3FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 8,
            }}
          >
            EXTIYOJ
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--muted)",
              textAlign: "center",
              marginBottom: 48,
              lineHeight: 1.6,
            }}
          >
            Qibla, Masjid va Zarurat —{" "}
            <br />
            musulmonlar uchun qulay ilova
          </p>

          {/* Auth section */}
          <div
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "rgba(56,189,248,0.12)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                🔐
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                  Telegram orqali kirish
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Xavfsiz va tez — 3 qadamda
                </div>
              </div>
            </div>

            {/* Steps */}
            {[
              { n: 1, text: `@${botUsername} Telegram botiga boring`, icon: "💬" },
              { n: 2, text: "/start bosing — kod yuboriladi", icon: "▶️" },
              { n: 3, text: "6 xonali kodni kiriting", icon: "🔢" },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--primary)",
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              </div>
            ))}

            <button
              className="btn-primary"
              onClick={openBot}
              style={{ marginTop: 8 }}
            >
              Telegram botga o&apos;tish →
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            ← Kirmasdan davom etish
          </button>
        </div>
      )}

      {/* OTP STEP */}
      {step === "otp" && (
        <div
          className="page-enter"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "rgba(56,189,248,0.1)",
              border: "1.5px solid rgba(56,189,248,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              marginBottom: 24,
            }}
          >
            📨
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Kodni kiriting
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              textAlign: "center",
              marginBottom: 36,
              lineHeight: 1.6,
            }}
          >
            @{botUsername} boti yuborgan
            <br />
            6 xonali kodni kiriting
          </p>

          {/* OTP inputs */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeInput(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`otp-input ${digit ? "filled" : ""}`}
                disabled={loading}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <div
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 13,
                color: "#FB7185",
                marginBottom: 16,
                width: "100%",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {loading && (
            <div style={{ fontSize: 13, color: "var(--primary)", marginBottom: 16 }}>
              Tekshirilmoqda...
            </div>
          )}

          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24, textAlign: "center" }}>
            {countdown > 0
              ? `Kod muddati: ${formatTime(countdown)}`
              : "Kod muddati tugadi"}
          </div>

          <button
            className="btn-primary"
            onClick={() => verifyCode(code.join(""))}
            disabled={code.some((d) => !d) || loading}
          >
            {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
          </button>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={() => {
                setStep("intro");
                setCode(["", "", "", "", "", ""]);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              ← Orqaga
            </button>
            <span style={{ color: "var(--border)" }}>|</span>
            <button
              onClick={openBot}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              Qayta yuborish
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS STEP */}
      {step === "success" && (
        <div
          className="page-enter"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #059669, #34D399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              marginBottom: 24,
              boxShadow: "0 8px 40px rgba(52,211,153,0.3)",
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            Muvaffaqiyatli!
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Kirish yakunlandi. Yo&apos;naltirilmoqda...
          </p>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
