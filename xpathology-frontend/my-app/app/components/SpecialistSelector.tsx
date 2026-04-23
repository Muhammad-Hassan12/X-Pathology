import React from 'react';

interface SpecialistSelectorProps {
  selected: "colon" | "brain";
  onChange: (s: "colon" | "brain") => void;
}

export default function SpecialistSelector({ selected, onChange }: SpecialistSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <button
        onClick={() => onChange("colon")}
        style={{
          textAlign: "left",
          background: selected === "colon" ? "rgba(0,210,150,0.06)" : "var(--surface)",
          border: `1.5px solid ${selected === "colon" ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 16,
          padding: "1.5rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--fg)", margin: "0 0 4px" }}>
              Colon Histopathology
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--fg-muted)", margin: 0 }}>H&E stained tissue patch</p>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--accent)",
            border: "1px solid rgba(0,210,150,0.3)",
            background: "rgba(0,210,150,0.1)",
            padding: "2px 8px",
            borderRadius: 6,
          }}>
            9 tissue classes
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
          Upload an H&E stained histopathology slide patch (JPEG or PNG)
        </p>
      </button>

      <button
        onClick={() => onChange("brain")}
        style={{
          textAlign: "left",
          background: selected === "brain" ? "rgba(0,150,255,0.06)" : "var(--surface)",
          border: `1.5px solid ${selected === "brain" ? "rgba(0,150,255,0.6)" : "var(--border)"}`,
          borderRadius: 16,
          padding: "1.5rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--fg)", margin: "0 0 4px" }}>
              Brain MRI Tumor
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--fg-muted)", margin: 0 }}>T1-weighted axial MRI scan</p>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "#60b8ef",
            border: "1px solid rgba(0,150,255,0.3)",
            background: "rgba(0,150,255,0.1)",
            padding: "2px 8px",
            borderRadius: 6,
          }}>
            4 tumor classes
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
          Upload an axial brain MRI scan (JPEG or PNG)
        </p>
      </button>
    </div>
  );
}
