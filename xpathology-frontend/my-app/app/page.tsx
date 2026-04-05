"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  prediction: string;
  severity: "Malignant" | "Benign";
  confidence: number;
  gradcam_image_base64: string;
  full_report: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseReport(report: string) {
  const clinicalMatch = report.match(
    /\*\*Section 1: Clinical Pathology Report\*\*\s*([\s\S]*?)(?=\*\*Section 2:|$)/
  );
  const patientMatch = report.match(
    /\*\*Section 2: Patient-Facing Summary\*\*\s*([\s\S]*?)$/
  );
  return {
    clinical: clinicalMatch ? clinicalMatch[1].trim() : report,
    patient: patientMatch ? patientMatch[1].trim() : "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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
  onFile,
  preview,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
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
        accept="image/jpeg,image/png"
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
              Drop H&E Slide Here
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.75rem",
                color: "var(--muted)",
              }}
            >
              .JPG or .PNG · histopathology section
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

function Spinner() {
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
          Analyzing cellular structures...
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "0.72rem",
            color: "var(--muted)",
          }}
        >
          CNN inference · Grad-CAM · Gemini report generation
        </p>
      </div>
    </div>
  );
}

function ConfidenceBadge({
  prediction,
  severity,
  confidence,
}: {
  prediction: string;
  severity: "Malignant" | "Benign";
  confidence: number;
}) {
  const isMalignant = severity === "Malignant";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 14px",
        borderRadius: 6,
        border: `1px solid ${isMalignant ? "rgba(255,80,80,0.4)" : "rgba(0,210,150,0.4)"}`,
        background: isMalignant
          ? "rgba(255,80,80,0.08)"
          : "rgba(0,210,150,0.08)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isMalignant ? "#ff5050" : "var(--accent)",
          boxShadow: `0 0 8px ${isMalignant ? "#ff5050" : "var(--accent)"}`,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          color: isMalignant ? "#ff8080" : "var(--accent)",
          letterSpacing: "0.08em",
        }}
      >
        {prediction.toUpperCase()} · {confidence.toFixed(1)}% confidence
      </span>
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
    { name: "Colon Malignant", path: "/sample/colon_aca_sample.jpg" },
    { name: "Colon Benign", path: "/sample/colon_n_sample.jpg" },
    { name: "Lung Malignant", path: "/sample/lung_aca_sample.jpeg" },
    { name: "Lung Benign", path: "/sample/lung_n_sample.jpeg" },
    { name: "Lung Squamous", path: "/sample/lung_scc_samlpe.jpeg" }
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
    <div style={{ marginTop: 24, textAlign: "center" }}>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        color: "var(--muted)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: 12,
      }}>
        Or try a sample slide:
      </p>
      <div style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSelect(s)}
            disabled={disabled}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseOver={(e) => {
              if(!disabled) {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "rgba(0,210,150,0.08)";
              }
            }}
            onMouseOut={(e) => {
              if(!disabled) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={s.path} 
              alt={s.name} 
              style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} 
            />
            <span style={{ 
              fontFamily: "var(--font-mono)", 
              fontSize: "0.7rem", 
              color: "var(--fg-muted)"
            }}>
              {s.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function XPathologyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analyze`, {
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
        } catch (_) {}
        throw new Error(errText || `Server error: ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. The server took too long to respond.");
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
              Deep Learning · XAI · Dual-Persona Reporting
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--fg)",
                marginBottom: 18,
              }}
            >
              Colon & Lung Cancer Detection
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
                from Histopathology
              </span>
            </h1>
            <p
              style={{
                maxWidth: 560,
                margin: "0 auto",
                fontSize: "0.88rem",
                color: "var(--fg-muted)",
                lineHeight: 1.7,
              }}
            >
              Upload an H&amp;E stained slide. The mobilenetv2-based CNN classifies
              the tissue, Grad-CAM visualizes the decision, and Gemini writes
              both a clinical report and a plain-English patient summary.
            </p>
          </section>

          {/* ── Upload Panel ── */}
          <section
            className="fade-up-1"
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
              Step 01 — Upload Slide
            </p>

            <UploadZone
              onFile={handleFile}
              preview={preview}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            <SampleGallery onSampleSelect={handleFile} disabled={loading} />

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
              <Spinner />
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
                  marginBottom: "1.5rem",
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
                  severity={result.severity}
                  confidence={result.confidence}
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
                {/* Left: Images */}
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
                        Original H&amp;E Slide
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
                </div>

                {/* Right: Reports */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <ReportCard
                    title="Clinical Pathology Report"
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