"use client";

import { useState, useCallback, useRef } from "react";
import SpecialistSelector from "./components/SpecialistSelector";

// Types
interface AnalysisResult {
  specialist?: string;
  anatomical_note?: string;
  prediction: string;
  prediction_display: string;
  severity: string;
  confidence: number;
  temperature_applied: number;
  probability_breakdown: Record<string, number>;
  gradcam_image_base64: string;
  full_report: string;
  processing_time_s: number;
}

// Helpers
function parseReport(report: string) {
  // Match Section 1 with either "Clinical Pathology Report" or "Radiology Report"
  const clinicalMatch = report.match(
    /\*\*Section 1:.*?\*\*\s*([\s\S]*?)(?=\*\*Section 2:|$)/
  );
  const patientMatch = report.match(
    /\*\*Section 2: Patient-Facing Summary\*\*\s*([\s\S]*?)$/
  );
  return {
    clinical: clinicalMatch ? clinicalMatch[1].trim() : report,
    patient: patientMatch ? patientMatch[1].trim() : "",
  };
}

function getSeverityColor(severity: string): string {
  if (severity === "Malignant" || severity === "High Concern") return "#ff5050";
  if (severity === "Moderate Concern") return "#fbbf24"; // amber
  return "var(--accent)"; // green for Benign / No Tumor Detected
}
function getSeverityBgColor(severity: string): string {
  if (severity === "Malignant" || severity === "High Concern") return "rgba(255,80,80,0.08)";
  if (severity === "Moderate Concern") return "rgba(251,191,36,0.08)";
  return "rgba(0,210,150,0.08)";
}
function getSeverityBorderColor(severity: string): string {
  if (severity === "Malignant" || severity === "High Concern") return "rgba(255,80,80,0.4)";
  if (severity === "Moderate Concern") return "rgba(251,191,36,0.4)";
  return "rgba(0,210,150,0.4)";
}
function getSeverityTextColor(severity: string): string {
  if (severity === "Malignant" || severity === "High Concern") return "#ff8080";
  if (severity === "Moderate Concern") return "#fcd34d";
  return "var(--accent)";
}

// Sub-components
function ScanlineOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }}
    />
  );
}

function GridBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,210,150,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,150,255,0.05) 0%, transparent 60%)
        `,
      }}
    />
  );
}

function UploadZone({
  specialist,
  onFile,
  preview,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  specialist: "colon" | "brain";
  onFile: (f: File) => void;
  preview: string | null;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="mobile-upload-padding"
      onClick={() => inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: "relative",
        border: `1.5px dashed ${isDragging ? "var(--accent)" : "rgba(0,210,150,0.3)"}`,
        borderRadius: 12,
        padding: "3rem 2rem",
        cursor: "pointer",
        textAlign: "center",
        background: isDragging
          ? "rgba(0,210,150,0.06)"
          : "rgba(255,255,255,0.02)",
        transition: "all 0.2s ease",
        minHeight: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/tiff"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="H&E slide preview"
            style={{
              maxHeight: 180,
              maxWidth: "100%",
              borderRadius: 8,
              objectFit: "contain",
              filter: "brightness(0.9) contrast(1.05)",
            }}
          />
          <p style={{ color: "var(--muted)", fontSize: "0.78rem", margin: 0 }}>
            Click or drag to replace
          </p>
        </>
      ) : (
        <>
          <MicroscopeIcon />
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--accent)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {specialist === "colon" ? "Drop H&E Slide Here" : "Drop MRI Scan Here"}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.75rem",
                color: "var(--muted)",
              }}
            >
              .JPG, .PNG or .TIFF · {specialist === "colon" ? "colorectal histopathology patch" : "axial T1-weighted MRI scan"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function MicroscopeIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18h12" />
      <path d="M12 18v-2" />
      <path d="M9 6l1.5 6H13.5L15 6" />
      <circle cx="12" cy="4" r="2" />
      <path d="M9 10H6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-3" />
    </svg>
  );
}

function Spinner({ specialist }: { specialist: string }) {
  const isBrain = specialist === "brain";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "3rem 0",
      }}
    >
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid rgba(0,210,150,0.15)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid transparent",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 8,
            border: "2px solid transparent",
            borderTopColor: "rgba(0,150,255,0.6)",
            borderRadius: "50%",
            animation: "spin 1.4s linear infinite reverse",
          }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "var(--accent)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {isBrain ? "Analyzing MRI scan..." : "Analyzing cellular structures..."}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "0.72rem",
            color: "var(--muted)",
          }}
        >
          {isBrain ? "EfficientNetB0" : "EfficientNetB1"} inference · Grad-CAM · Gemini report generation
        </p>
      </div>
    </div>
  );
}

function ConfidenceBadge({
  prediction,
  predictionDisplay,
  severity,
  confidence,
}: {
  prediction: string;
  predictionDisplay: string;
  severity: string;
  confidence: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 14px",
        borderRadius: 6,
        border: `1px solid ${getSeverityBorderColor(severity)}`,
        background: getSeverityBgColor(severity),
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: getSeverityColor(severity),
          boxShadow: `0 0 8px ${getSeverityColor(severity)}`,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          color: getSeverityTextColor(severity),
          letterSpacing: "0.08em",
        }}
      >
        {prediction} · {confidence.toFixed(1)}%
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.72rem",
          color: "var(--fg-muted)",
        }}
      >
        {predictionDisplay}
      </span>
    </div>
  );
}

function ProbabilityBreakdown({
  breakdown,
  predicted,
  severity,
  specialist,
}: {
  breakdown: Record<string, number>;
  predicted: string;
  severity: string;
  specialist: string;
}) {
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(...Object.values(breakdown), 1);
  const classCount = Object.keys(breakdown).length;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            color: "var(--fg)",
            letterSpacing: "0.02em",
          }}
        >
          Probability Breakdown
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "#a78bfa",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: 4,
            padding: "2px 8px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {classCount}-Class
        </span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(([cls, pct]) => {
          const isPredicted = cls === predicted;
          const barColor = isPredicted
            ? getSeverityColor(severity)
            : "rgba(255,255,255,0.15)";

          return (
            <div key={cls} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: isPredicted ? "var(--fg)" : "var(--muted)",
                  width: 42,
                  flexShrink: 0,
                  fontWeight: isPredicted ? 600 : 400,
                }}
              >
                {cls}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${(pct / maxVal) * 100}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: barColor,
                    transition: "width 0.6s ease",
                    minWidth: pct > 0 ? 2 : 0,
                    boxShadow: isPredicted ? `0 0 8px ${barColor}` : "none",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: isPredicted ? "var(--fg)" : "var(--muted)",
                  width: 48,
                  textAlign: "right",
                  flexShrink: 0,
                  fontWeight: isPredicted ? 600 : 400,
                }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProcessingStats({
  time,
  temperature,
  specialist,
}: {
  time: number;
  temperature: number;
  specialist: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: "0.72rem" }}>⏱</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--muted)",
          }}
        >
          {time.toFixed(1)}s
        </span>
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: "0.72rem" }}>🌡</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--muted)",
          }}
        >
          T={temperature.toFixed(4)}
        </span>
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: "0.72rem" }}>🧠</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--muted)",
          }}
        >
          {specialist === "colon" ? "EfficientNetB1" : "EfficientNetB0"}
        </span>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  tag,
  content,
  accent,
}: {
  title: string;
  tag: string;
  content: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            color: "var(--fg)",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: accent,
            border: `1px solid ${accent}55`,
            borderRadius: 4,
            padding: "2px 8px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {tag}
        </span>
      </div>
      <div
        style={{
          padding: "16px 20px",
          fontSize: "0.82rem",
          lineHeight: 1.75,
          color: "var(--fg-muted)",
          overflowY: "auto",
          maxHeight: 320,
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function SampleGallery({ onSampleSelect, disabled }: { onSampleSelect: (file: File) => void, disabled: boolean }) {
  const SAMPLES = [
    { code: "ADI", name: "Adipose Tissue", path: "/sample/Adipose Tissue.jpg", malignant: false },
    { code: "BACK", name: "Background", path: "/sample/Background.png", malignant: false },
    { code: "DEB", name: "Debris / Necrosis", path: "/sample/Debris  Necrosis.png", malignant: false },
    { code: "LYM", name: "Lymphocytes", path: "/sample/Lymphocytes.png", malignant: false },
    { code: "MUC", name: "Mucus", path: "/sample/Mucus.jfif", malignant: false },
    { code: "MUS", name: "Smooth Muscle", path: "/sample/Smooth Muscle.png", malignant: false },
    { code: "NORM", name: "Normal Colon Mucosa", path: "/sample/Normal Colon Mucosa.png", malignant: false },
    { code: "STR", name: "Stroma", path: "/sample/Cancer-Associated Stroma.png", malignant: false },
    { code: "TUM", name: "Tumour (Sample 1)", path: "/sample/Colorectal Adenocarcinoma (Tumour).jpg", malignant: true },
    { code: "TUM", name: "Tumour (Sample 2)", path: "/sample/Colorectal Adenocarcinoma (Tumour)2.jpg", malignant: true },
  ];

  const handleSelect = async (sample: typeof SAMPLES[0]) => {
    if (disabled) return;
    try {
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const file = new File([blob], sample.path.split('/').pop() || 'sample.jpg', { type: blob.type });
      onSampleSelect(file);
    } catch (err) {
      console.error("Failed to load sample:", err);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        color: "var(--muted)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: 12,
        textAlign: "center",
      }}>
        Or try a sample slide:
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,210,150,0.2) transparent",
        }}
      >
        {SAMPLES.map((s, i) => {
          const borderColor = s.malignant ? "rgba(255,80,80,0.2)" : "rgba(255,255,255,0.08)";
          const hoverBorder = s.malignant ? "rgba(255,80,80,0.5)" : "rgba(0,210,150,0.4)";
          const hoverBg = s.malignant ? "rgba(255,80,80,0.06)" : "rgba(0,210,150,0.06)";
          return (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              disabled={disabled}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${borderColor}`,
                borderRadius: 10,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: disabled ? 0.5 : 1,
                flexShrink: 0,
                minWidth: 90,
              }}
              onMouseOver={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = hoverBorder;
                  e.currentTarget.style.background = hoverBg;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.path}
                alt={s.name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 6,
                  objectFit: "cover",
                  border: `1px solid ${s.malignant ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.06)"}`,
                }}
              />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                fontWeight: 600,
                color: s.malignant ? "#ff8080" : "var(--accent)",
                letterSpacing: "0.08em",
              }}>
                {s.code}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                color: "var(--muted)",
                maxWidth: 80,
                textAlign: "center",
                lineHeight: 1.2,
              }}>
                {s.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function XPathologyPage() {
  const [specialist, setSpecialist] = useState<"colon" | "brain">("colon");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSpecialistChange = useCallback((s: "colon" | "brain") => {
    setSpecialist(s);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("specialist", specialist);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://rarfileexe-xpathology-backend.hf.space"}/api/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) throw new Error(parsed.error);
        } catch (_) { }
        throw new Error(errText || `Server error: ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. The server may be waking up — please try again in a moment.");
      } else {
        const msg =
          err instanceof Error ? err.message : "Unknown error occurred.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const reportSections = result ? parseReport(result.full_report) : null;

  return (
    <>
      <ScanlineOverlay />
      <GridBackground />

      <div style={{ position: "relative", zIndex: 1 }}>

        <main
          className="mobile-main-padding"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "4rem 2rem 6rem",
          }}
        >
          {/* ── Hero ── */}
          <section
            className="fade-up"
            style={{ textAlign: "center", marginBottom: "3.5rem" }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--accent)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Multi-Model · Temperature Calibrated · XAI · Dual reporting
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 8vw, 3.6rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--fg)",
                marginBottom: 18,
              }}
            >
              AI Oncology Screening
              <br />
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--accent) 0%, #60efb8 50%, var(--accent-blue) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Platform
              </span>
            </h1>
            <p
              style={{
                maxWidth: 600,
                margin: "0 auto",
                fontSize: "0.88rem",
                color: "var(--fg-muted)",
                lineHeight: 1.7,
              }}
            >
              Select a specialized model and upload your medical scan. Our pipeline provides
              temperature-calibrated predictions, Grad-CAM explainability heatmaps, and comprehensive
              Dual-Persona reporting powered by Gemini API.
            </p>
          </section>

          {/* ── Specialist Selector ── */}
          <SpecialistSelector selected={specialist} onChange={handleSpecialistChange} />

          {/* ── Upload Panel ── */}
          <section
            className="fade-up-1 mobile-section-padding"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "2rem",
              marginBottom: "2rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "var(--muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Step 01 — Upload {specialist === "colon" ? "Colorectal Slide" : "Brain MRI"}
            </p>

            <UploadZone
              specialist={specialist}
              onFile={handleFile}
              preview={preview}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            {specialist === "colon" ? (
              <SampleGallery onSampleSelect={handleFile} disabled={loading} />
            ) : (
              <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                <p>Ensure your MRI scan is clearly visible and follows the T1-weighted axial-plane view for best results.</p>
              </div>
            )}

            {file && (
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                  }}
                >
                  {file.name} &nbsp;·&nbsp;{" "}
                  {(file.size / 1024).toFixed(0)} KB
                </span>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{
                    background: loading
                      ? "rgba(0,210,150,0.1)"
                      : "var(--accent)",
                    color: loading ? "var(--accent)" : "#040a07",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 28px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    letterSpacing: "0.05em",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading ? "Analyzing..." : "Run Analysis →"}
                </button>
              </div>
            )}
          </section>

          {/* ── Loading ── */}
          {loading && (
            <section
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                marginBottom: "2rem",
              }}
            >
              <Spinner specialist={specialist} />
            </section>
          )}

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                background: "rgba(255,80,80,0.06)",
                border: "1px solid rgba(255,80,80,0.25)",
                borderRadius: 10,
                padding: "14px 20px",
                marginBottom: "2rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "#ff8080",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* ── Results Dashboard ── */}
          {result && reportSections && (
            <section className="fade-up">
              {/* Result header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Step 02 — Analysis Results
                </p>
                <ConfidenceBadge
                  prediction={result.prediction}
                  predictionDisplay={result.prediction_display}
                  severity={result.severity}
                  confidence={result.confidence}
                />
              </div>

              {/* Anatomical Note Warning Banner */}
              {result.anatomical_note && (
                <div style={{
                  marginBottom: "1.5rem",
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  color: "#fcd34d",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                  <span><strong>Anatomical note:</strong> {result.anatomical_note}</span>
                </div>
              )}

              {/* Processing stats */}
              <div style={{ marginBottom: "1.5rem" }}>
                <ProcessingStats
                  time={result.processing_time_s}
                  temperature={result.temperature_applied}
                  specialist={result.specialist || specialist}
                />
              </div>

              {/* Two-column layout */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.5rem",
                  alignItems: "start",
                }}
              >
                {/* Left: Images + Probability */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Original */}
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.85rem",
                          color: "var(--fg)",
                        }}
                      >
                        {(result.specialist || specialist) === "brain" ? "Original MRI Scan" : "Original H&amp;E Slide"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        INPUT
                      </span>
                    </div>
                    {preview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt="Original slide"
                        style={{ width: "100%", display: "block" }}
                      />
                    )}
                  </div>

                  {/* Grad-CAM */}
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid rgba(0,210,150,0.2)",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 0 24px rgba(0,210,150,0.06)",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(0,210,150,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.85rem",
                          color: "var(--fg)",
                        }}
                      >
                        Grad-CAM XAI Heatmap
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--accent)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        EXPLAINABILITY
                      </span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.gradcam_image_base64}
                      alt="Grad-CAM overlay"
                      style={{ width: "100%", display: "block" }}
                    />
                    <div
                      style={{
                        padding: "10px 16px",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.68rem",
                          color: "var(--muted)",
                        }}
                      >
                        🔴 Red/yellow = high CNN attention &nbsp;·&nbsp; 🔵
                        Blue = low attention
                      </p>
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <ProbabilityBreakdown
                    breakdown={result.probability_breakdown}
                    predicted={result.prediction}
                    severity={result.severity}
                    specialist={result.specialist || specialist}
                  />
                </div>

                {/* Right: Reports */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <ReportCard
                    title={result.specialist === "brain" ? "Radiology Report" : "Histopathology Report"}
                    tag="For Clinicians"
                    content={reportSections.clinical}
                    accent="var(--accent-blue)"
                  />
                  <ReportCard
                    title="Patient-Facing Summary"
                    tag="Plain English"
                    content={reportSections.patient}
                    accent="var(--accent)"
                  />


                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}