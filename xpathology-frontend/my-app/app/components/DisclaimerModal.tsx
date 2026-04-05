"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "xpathology-disclaimer-accepted";

export default function DisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        animation: "fadeIn 0.35s ease both",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          maxWidth: 540,
          width: "100%",
          background: "linear-gradient(145deg, #111820, #0d1117)",
          border: "1px solid rgba(255,180,0,0.2)",
          borderRadius: 20,
          padding: "2.5rem 2rem 2rem",
          animation: "scaleIn 0.4s 0.1s ease both",
          boxShadow: `
            0 0 60px rgba(255,180,0,0.06),
            0 0 120px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
        }}
      >
        {/* Top glow bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(255,180,0,0.5), transparent)",
            borderRadius: "0 0 2px 2px",
          }}
        />

        {/* Warning icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,180,0,0.08)",
              border: "1px solid rgba(255,180,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,180,0,0.85)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--fg)",
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: "0.02em",
          }}
        >
          Important Medical Disclaimer
        </h2>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            color: "var(--muted)",
            textAlign: "center",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Please read carefully before proceeding
        </p>

        {/* Content */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 24,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              {
                icon: "🔬",
                text: "X-Pathology is a research & educational AI tool. It is NOT FDA-approved diagnostic software.",
              },
              {
                icon: "⚕️",
                text: "This tool is NOT a substitute for professional medical diagnosis by a licensed pathologist.",
              },
              {
                icon: "📋",
                text: "All AI-generated results MUST be reviewed and verified by a qualified medical professional.",
              },
              {
                icon: "🚫",
                text: "Do NOT make any clinical or treatment decisions based solely on this tool's output.",
              },
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Accept button */}
        <button
          onClick={handleAccept}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 10,
            border: "1px solid rgba(255,180,0,0.3)",
            background:
              "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,180,0,0.06))",
            color: "rgba(255,200,60,0.95)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "0.9rem",
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(255,180,0,0.2), rgba(255,180,0,0.1))";
            e.currentTarget.style.borderColor = "rgba(255,180,0,0.5)";
            e.currentTarget.style.boxShadow =
              "0 0 20px rgba(255,180,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,180,0,0.06))";
            e.currentTarget.style.borderColor = "rgba(255,180,0,0.3)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          I Understand &amp; Accept
        </button>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "var(--muted)",
            textAlign: "center",
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          By proceeding, you acknowledge that this tool is intended solely for
          research and educational purposes.
        </p>
      </div>
    </div>
  );
}
