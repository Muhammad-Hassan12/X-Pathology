"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Analyze" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(14px)",
        background: "rgba(7,11,15,0.85)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left — Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 10px var(--accent)",
            animation: "pulse 2.5s ease-in-out infinite",
          }}
        />
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.06em",
            color: "var(--fg)",
            textDecoration: "none",
          }}
        >
          X-PATHOLOGY
        </Link>
      </div>

      {/* Center — Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                position: "relative",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive ? "var(--accent)" : "var(--muted)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 6,
                background: isActive ? "rgba(0,210,150,0.08)" : "transparent",
                border: isActive
                  ? "1px solid rgba(0,210,150,0.2)"
                  : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--fg-muted)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right — Tagline (hidden on mobile) */}
      <style>{`
        .header-tagline { display: block; }
        @media (max-width: 768px) { .header-tagline { display: none; } }
      `}</style>
      <span
        className="header-tagline"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--muted)",
          letterSpacing: "0.1em",
        }}
      >
        AgenticEra Systems · AI-Assisted Oncology Screening
      </span>
    </header>
  );
}
