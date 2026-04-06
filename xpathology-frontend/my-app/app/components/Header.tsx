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
      className="mobile-header-padding"
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
      <div className="header-left">
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
            whiteSpace: "nowrap",
          }}
        >
          X-PATHOLOGY
        </Link>
      </div>

      {/* Center — Nav */}
      <nav className="header-nav">
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

      {/* Right — Tagline & GitHub Link */}
      <style>{`
        .header-left { display: flex; align-items: center; gap: 10px; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .header-nav { display: flex; align-items: center; gap: 6px; }
        @media (min-width: 769px) {
          .header-left { flex: 1; }
          .header-right { flex: 1; justify-content: flex-end; }
        }
        .header-tagline { display: block; }
        @media (max-width: 768px) { .header-tagline { display: none; } }
      `}</style>
      <div className="header-right">
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
        <a
          href="https://github.com/Muhammad-Hassan12/X-Pathology"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            color: "var(--fg-muted)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            e.currentTarget.style.color = "var(--fg)";
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--fg-muted)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }}
          title="View X-Pathology on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}
