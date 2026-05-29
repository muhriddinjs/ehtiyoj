"use client";

import { usePathname, useRouter } from "next/navigation";
import { Compass, Toilet, MoveRight } from "lucide-react";

const TABS = [
  {
    id: "qibla",
    href: "/",
    label: "Qibla",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="12" r="10"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
        />
        <path
          d="M12 2L14 9H10L12 2Z"
          fill={active ? "#38BDF8" : "#64748B"}
        />
        <path
          d="M12 22L10 15H14L12 22Z"
          fill={active ? "#334155" : "#334155"}
        />
        <circle cx="12" cy="12" r="2" fill={active ? "#38BDF8" : "#64748B"} />
      </svg>
    ),
  },
  {
    id: "zarurat",
    href: "/zarurat",
    label: "Zarurat",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="7" height="11" rx="3.5"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
        />
        <rect
          x="14" y="3" width="7" height="11" rx="3.5"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
        />
        <path
          d="M6.5 14v7M17.5 14v7"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "masjid",
    href: "/masjid",
    label: "Masjid",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 21h18M5 21V10l7-7 7 7v11"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 21v-5h4v5"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3v-2M9 5.5C9 4 10.3 3 12 3s3 1 3 2.5"
          stroke={active ? "#38BDF8" : "#64748B"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    pathname === "/" ? "qibla"
    : pathname.startsWith("/zarurat") ? "zarurat"
    : pathname.startsWith("/masjid") ? "masjid"
    : "qibla";

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        maxWidth: "var(--app-width)",
        zIndex: 50,
        background: "rgba(7, 20, 40, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(56, 189, 248, 0.08)",
      }}
    >
      <div style={{ display: "flex" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              style={{
                flex: 1,
                padding: "12px 0 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "#38BDF8" : "#64748B",
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "inherit",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              {/* Active glow */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 40,
                    height: 2,
                    background:
                      "linear-gradient(90deg, transparent, #38BDF8, transparent)",
                    borderRadius: "0 0 4px 4px",
                  }}
                />
              )}
              {tab.icon(isActive)}
              <span>{tab.label}</span>
              {isActive && <span className="tab-active-dot" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
