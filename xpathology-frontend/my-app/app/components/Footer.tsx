"use client";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "rgba(7,11,15,0.92)",
        backdropFilter: "blur(10px)",
        padding: 0,
        marginTop: "auto",
      }}
    >
      {/* Disclaimer Banner */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,180,0,0.1)",
          padding: "12px 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "rgba(255,180,0,0.03)",
        }}
      >
        <span style={{ fontSize: "0.85rem" }}>⚠️</span>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "rgba(255,180,0,0.65)",
            letterSpacing: "0.04em",
            lineHeight: 1.5,
            textAlign: "center",
            margin: 0,
          }}
        >
          X-Pathology is an AI-assisted research &amp; educational tool — NOT
          FDA-approved diagnostic software. All results must be verified by a
          licensed pathologist.
        </p>
      </div>

      {/* Footer body */}
      <div
        style={{
          padding: "16px 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Credits */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--muted)",
              letterSpacing: "0.06em",
            }}
          >
            © {new Date().getFullYear()}{" "}
            <a
              href="https://www.linkedin.com/company/AgenticEra-Systems"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              AgenticEra Systems
            </a>
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="https://github.com/Muhammad-Hassan12"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--fg-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            <GitHubIcon size={14} />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/company/AgenticEra-Systems"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--fg-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            <LinkedInIcon size={14} />
            LinkedIn
          </a>
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--muted)",
              letterSpacing: "0.08em",
            }}
          >
            v2.0 · MobileNetV2
          </span>
        </div>
      </div>
    </footer>
  );
}

/* Inline SVG Icons */
function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
