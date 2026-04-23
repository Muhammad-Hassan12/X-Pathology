"use client";

import { useEffect, useRef, useState } from "react";

// ANIMATED COUNTER — counts up when scrolled into view
function AnimatedStat({
  value,
  suffix,
  label,
  delay = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1400;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div
      ref={ref}
      style={{
        textAlign: "center",
        padding: "24px 12px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        animation: `fadeUp 0.5s ${delay}s ease both`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        <span className="gradient-text">
          {suffix === "%" ? count.toFixed(1) : count}
          {suffix}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// SVG ICONS
function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// PIPELINE STEP — for the "How It Works" section
function PipelineStep({
  step,
  icon,
  title,
  description,
  isLast,
  delay,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
  isLast?: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        animation: `fadeUp 0.5s ${delay}s ease both`,
      }}
    >
      {/* Timeline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,210,150,0.08)",
            border: "1px solid rgba(0,210,150,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >
          {icon}
        </div>
        {!isLast && (
          <div
            style={{
              width: 1,
              height: 40,
              background:
                "linear-gradient(to bottom, rgba(0,210,150,0.3), rgba(0,210,150,0.05))",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--accent)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Step {String(step).padStart(2, "0")}
          </span>
        </div>
        <h4
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--fg)",
            marginBottom: 4,
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--fg-muted)",
            lineHeight: 1.65,
            maxWidth: 400,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ABOUT PAGE
export default function AboutPage() {
  const [, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* ── Background effects ── */}
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

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "3rem 2rem 6rem",
        }}
      >
        {/* HERO*/}
        <section
          className="fade-up"
          style={{ textAlign: "center", marginBottom: "4rem" }}
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
            About X-Pathology
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
              marginBottom: 18,
            }}
          >
            The Engineering Journey
            <br />
            <span className="gradient-text">From Single Model to Multi-Specialist Platform</span>
          </h1>
          <p
            style={{
              maxWidth: 660,
              margin: "0 auto",
              fontSize: "0.88rem",
              color: "var(--fg-muted)",
              lineHeight: 1.7,
            }}
          >
            Building a reliable medical AI requires rigorous iteration.
            X-Pathology has evolved through four major architectural versions —
            from a binary VGG16 baseline to a multi-specialist platform with
            temperature-calibrated CNN models for both{" "}
            <strong style={{ color: "var(--fg)" }}>colorectal histopathology</strong> and{" "}
            <strong style={{ color: "var(--fg)" }}>brain tumor MRI</strong> classification,
            each with Grad-CAM explainability and Gemini-powered dual-persona reporting.
          </p>
        </section>

        {/*STATS BAR*/}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: 16,
            marginBottom: "4rem",
          }}
        >
          <AnimatedStat value={2} suffix="" label="Specialist Models" delay={0} />
          <AnimatedStat value={13} suffix="" label="Total Classes" delay={0.1} />
          <AnimatedStat value={99.1} suffix="%" label="Colon Internal Acc" delay={0.2} />
          <AnimatedStat value={92.7} suffix="%" label="Colon External Acc" delay={0.3} />
          <AnimatedStat value={96.2} suffix="%" label="Brain Holdout Acc" delay={0.4} />
        </section>

        {/* VERSION TIMELINE*/}
        <section className="fade-up-1" style={{ marginBottom: "4rem" }}>
          <SectionLabel label="Architecture Evolution" />

          {/* Version 1.0 */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "2rem",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "6px 16px",
                background: "rgba(255,80,80,0.08)",
                borderBottomLeftRadius: 12,
                border: "1px solid rgba(255,80,80,0.15)",
                borderTop: "none",
                borderRight: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "#ff8080",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Deprecated
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--fg)",
                marginBottom: 6,
              }}
            >
              Version 1.0: Establishing the Baseline{" "}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}>(VGG16)</span>
            </h3>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 18,
              }}
            >
              Our initial proof-of-concept utilized a heavyweight <strong style={{ color: "var(--fg)" }}>VGG16</strong> architecture
              focused on a binary classification task (Colon Adenocarcinoma vs. Normal). While this
              150MB+ model successfully established our foundational Grad-CAM explainability
              pipeline and achieved high baseline accuracy, it exhibited a common deep learning
              phenomenon: <em>network overconfidence</em>.
            </p>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
              }}
            >
              The massive parameter count acting on a simple binary sigmoid output led to
              mathematical saturation, resulting in &quot;100% confidence&quot; predictions even on
              out-of-distribution data. In a clinical setting, nuance is critical. We needed a
              scalpel, not a sledgehammer.
            </p>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>

          {/* Version 2.0 */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "2rem",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "6px 16px",
                background: "rgba(255,180,0,0.08)",
                borderBottomLeftRadius: 12,
                border: "1px solid rgba(255,180,0,0.15)",
                borderTop: "none",
                borderRight: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "rgba(255,180,0,0.8)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Superseded
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--fg)",
                marginBottom: 6,
              }}
            >
              Version 2.0: The Multi-Organ Experiment{" "}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}>(MobileNetV2)</span>
            </h3>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 18,
              }}
            >
              We transitioned to a lightweight <strong style={{ color: "var(--fg)" }}>MobileNetV2</strong> backbone (8.6 MB)
              and expanded to a 5-class multi-organ model covering both Colon and Lung histopathology.
              This achieved ~98% accuracy and eliminated the binary overconfidence issue.
            </p>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 18,
              }}
            >
              <strong style={{ color: "#ff8080" }}>However, a critical problem emerged:</strong> although the model detected cancer
              accurately, it sometimes produced <em>organ-mismatched reports</em> — classifying colon tissue
              with a lung report and vice versa. This cross-organ confusion made the multi-organ
              approach unreliable for clinical-grade screening and motivated a fundamental rethinking
              of the model scope.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              {[
                { icon: "✅", label: "Cancer detection accurate" },
                { icon: "✅", label: "17× smaller than VGG16" },
                { icon: "⚠️", label: "Organ confusion in reports" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    fontSize: "0.78rem",
                    color: "var(--fg-muted)",
                  }}
                >
                  <span>{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>

          {/* Version 3.0 */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "2rem",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "6px 16px",
                background: "rgba(0,210,150,0.08)",
                borderBottomLeftRadius: 12,
                border: "1px solid rgba(0,210,150,0.15)",
                borderTop: "none",
                borderRight: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--accent)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Foundation
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--fg)",
                marginBottom: 6,
              }}
            >
              Version 3.0: The Colon Specialist{" "}
              <span style={{ color: "var(--accent)", fontWeight: 400 }}>(EfficientNetB1)</span>
            </h3>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 18,
              }}
            >
              To solve the organ-confusion problem, we adopted a <strong style={{ color: "var(--fg)" }}>single-organ specialist</strong> strategy.
              The <strong style={{ color: "var(--fg)" }}>EfficientNetB1</strong> backbone trained exclusively on
              NCT-CRC-HE-100K and validated on the independent CRC-VAL-HE-7K holdout set —
              achieving <strong style={{ color: "var(--accent)" }}>99.1% internal</strong> and{" "}
              <strong style={{ color: "var(--accent)" }}>92.7% external accuracy</strong> across 9 colorectal tissue types
              with post-training temperature calibration (T=0.5576).
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              {[
                { icon: "✅", label: "9-class colorectal classification" },
                { icon: "✅", label: "Temperature-calibrated confidence" },
                { icon: "✅", label: "External holdout validated" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    fontSize: "0.78rem",
                    color: "var(--fg-muted)",
                  }}
                >
                  <span>{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>

          {/* Version 4.0 — CURRENT */}
          <div
            style={{
              background: "rgba(0,210,150,0.02)",
              border: "1px solid rgba(0,210,150,0.15)",
              borderRadius: 16,
              padding: "2rem",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 40px rgba(0,210,150,0.04)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "6px 16px",
                background: "rgba(0,210,150,0.08)",
                borderBottomLeftRadius: 12,
                border: "1px solid rgba(0,210,150,0.15)",
                borderTop: "none",
                borderRight: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--accent)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Current
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--fg)",
                marginBottom: 6,
              }}
            >
              Version 4.0: Multi-Specialist Platform{" "}
              <span style={{ color: "var(--accent)", fontWeight: 400 }}>(Colon + Brain)</span>
            </h3>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 22,
              }}
            >
              V4 transforms X-Pathology from a single-model tool into a{" "}
              <strong style={{ color: "var(--fg)" }}>multi-specialist diagnostic platform</strong>.
              A new <strong style={{ color: "var(--fg)" }}>EfficientNetB0 Brain Tumor MRI Specialist</strong>{" "}
              joins the Colon Specialist, classifying brain MRI scans into 4 tumor categories.
              The backend now uses a <strong style={{ color: "var(--fg)" }}>dynamic specialist routing architecture</strong>,
              loading and dispatching to the correct model based on user selection — proving that
              the specialist-per-organ paradigm scales cleanly to new medical domains.
            </p>

            {/* Milestones */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {[
                {
                  num: "01",
                  title: "Multi-Specialist Router",
                  desc: "A dynamic backend architecture loads multiple specialist CNNs at startup, each with its own temperature calibration, class labels, and Grad-CAM target layers. The /api/analyze endpoint routes to the correct specialist via a simple parameter.",
                  accent: "var(--accent)",
                },
                {
                  num: "02",
                  title: "Brain Tumor MRI Specialist",
                  desc: "EfficientNetB0 trained on the Brain Tumor MRI Dataset classifies glioma, meningioma, pituitary tumor, and no-tumor. Temperature-calibrated (T=0.7867) with 96.2% holdout accuracy on 1,600 unseen images.",
                  accent: "var(--accent-blue)",
                },
                {
                  num: "03",
                  title: "Anatomical Plausibility Check",
                  desc: "For brain MRI, the system validates that Grad-CAM activation centroids align with expected anatomical locations — flagging potential misclassifications when heatmaps highlight implausible regions.",
                  accent: "#a78bfa",
                },
                {
                  num: "04",
                  title: "Domain-Adapted Prompts",
                  desc: "Gemini receives specialist-specific prompts: pathology terminology for colon analysis, radiology terminology for brain MRI. Each domain gets appropriately tailored clinical and patient-facing report sections.",
                  accent: "#f59e0b",
                },
              ].map((m) => (
                <div
                  key={m.num}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "18px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: m.accent,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Milestone {m.num}
                  </span>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginBottom: 6,
                    }}
                  >
                    {m.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--fg-muted)",
                      lineHeight: 1.65,
                    }}
                  >
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODEL SPOTLIGHT — Brain Specialist*/}
        <section className="fade-up-2" style={{ marginBottom: "4rem" }}>
          <SectionLabel label="Model Spotlight — Brain Tumor MRI Specialist" />

          <div
            style={{
              background: "rgba(33,150,243,0.02)",
              border: "1px solid rgba(33,150,243,0.12)",
              borderRadius: 16,
              padding: "2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: "linear-gradient(90deg, transparent, var(--accent-blue), transparent)",
              }}
            />

            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 22,
              }}
            >
              The <strong style={{ color: "var(--fg)" }}>XPathology Brain Tumor MRI Specialist</strong> is a
              fine-tuned <strong style={{ color: "var(--fg)" }}>EfficientNetB0</strong> CNN trained to classify
              T1-weighted axial brain MRI scans into 4 diagnostic categories: glioma, meningioma,
              pituitary tumor, and no tumor. Trained on the{" "}
              <strong style={{ color: "var(--fg)" }}>Brain Tumor MRI Dataset</strong>{" "}
              (Masoud Nickparvar, Kaggle), it uses the dataset&apos;s standard Training/Testing split
              with a 1,600-image holdout set that was never seen during training.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
                marginBottom: 22,
              }}
            >
              {[
                { label: "Architecture", value: "EfficientNetB0 (ImageNet)", icon: "🏗️" },
                { label: "Input Size", value: "224 × 224 × 3 (RGB)", icon: "📐" },
                { label: "Output", value: "4-class softmax", icon: "🎯" },
                { label: "Temperature", value: "T = 0.7867", icon: "🌡️" },
                { label: "Holdout Accuracy", value: "96.2% (1,600 images)", icon: "📊" },
                { label: "Training Hardware", value: "Kaggle T4 (single GPU)", icon: "⚡" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--muted)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--fg)",
                        fontWeight: 500,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 18,
              }}
            >
              The model uses a <strong style={{ color: "var(--fg)" }}>two-phase training strategy</strong>:
              a 10-epoch warm-up with a frozen backbone (LR=1e-3), followed by fine-tuning with the
              top 20% of layers unfrozen (LR=1e-5). MRI-specific augmentations include horizontal
              flips (brain symmetry), ±15° rotation, brightness/contrast variation — but no vertical
              flip or hue/saturation changes, as these are anatomically invalid for MRI.
            </p>

            <div
              style={{
                padding: "14px 18px",
                borderRadius: 10,
                background: "rgba(251,191,36,0.04)",
                border: "1px solid rgba(251,191,36,0.12)",
                fontSize: "0.78rem",
                color: "var(--fg-muted)",
                lineHeight: 1.65,
              }}
            >
              <strong style={{ color: "#fbbf24" }}>Known limitation:</strong>{" "}
              Glioma recall is ~78%, consistent with a dataset-level ceiling confirmed across
              4 training runs. The glioma↔meningioma overlap is inherent to 2D T1-weighted MRI
              without multi-modal or 3D volumetric context. This is a single-slice classifier —
              clinical diagnosis uses full 3D volumes.
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <a
                href="https://huggingface.co/rarfileexe/xpathology-brain-specialist"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(33,150,243,0.2)",
                  background: "rgba(33,150,243,0.06)",
                  color: "#64b5f6",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.04em",
                }}
              >
                🤗 View on Hugging Face
              </a>
              <a
                href="https://github.com/Muhammad-Hassan12/xpathology-brain-specialist"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.04em",
                }}
              >
                📓 Training Notebook
              </a>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — Pipeline*/}
        <section className="fade-up-2" style={{ marginBottom: "4rem" }}>
          <SectionLabel label="How It Works" />

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "2rem",
            }}
          >
            <PipelineStep
              step={1}
              icon="🧠"
              title="Select Specialist & Upload"
              description="Choose the specialist model — Colon (H&E histopathology patch) or Brain (T1-weighted MRI scan). Upload via drag-and-drop, file picker, or the pre-loaded sample gallery."
              delay={0.1}
            />
            <PipelineStep
              step={2}
              icon="🧪"
              title="Specialist CNN Inference"
              description="The selected specialist model processes the image: EfficientNetB1 for 9-class colorectal tissue classification (240×240) or EfficientNetB0 for 4-class brain tumor classification (224×224)."
              delay={0.2}
            />
            <PipelineStep
              step={3}
              icon="🌡️"
              title="Temperature-Calibrated Confidence"
              description="Post-training temperature scaling converts raw logits into calibrated probabilities. Colon uses T=0.5576, Brain uses T=0.7867 — each tuned on its holdout set."
              delay={0.3}
            />
            <PipelineStep
              step={4}
              icon="🔥"
              title="Grad-CAM XAI Heatmap"
              description="Gradient-weighted Class Activation Mapping targets specialist-specific layers — block7a_project_bn for Colon, top_conv for Brain — generating visual explanations of what the CNN focused on."
              delay={0.4}
            />
            <PipelineStep
              step={5}
              icon="✨"
              title="Gemini 3.1 Flash Lite LLM Analysis"
              description="Both the original image and Grad-CAM overlay are sent to Gemini with domain-adapted prompts — pathology terminology for colon, radiology terminology for brain MRI. A dual-persona report is generated."
              delay={0.5}
            />
            <PipelineStep
              step={6}
              icon="📋"
              title="Dual-Persona Report"
              description="The final dashboard displays: the original image, Grad-CAM overlay, full probability breakdown, a Clinical/Radiology Report for professionals, and a compassionate Patient-Facing Summary."
              isLast
              delay={0.6}
            />
          </div>
        </section>

        {/* TECH STACK*/}
        <section className="fade-up-3" style={{ marginBottom: "4rem" }}>
          <SectionLabel label="Tech Stack" />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                name: "TensorFlow / Keras",
                desc: "Deep learning backbone powering the EfficientNetB1 Colon Specialist (9-class) and EfficientNetB0 Brain Specialist (4-class) with temperature-calibrated inference.",
                color: "#ff6f00",
                icon: "🧪",
              },
              {
                name: "FastAPI",
                desc: "High-performance async Python backend with dynamic multi-specialist model routing, Grad-CAM generation, and calibrated probability computation.",
                color: "#009688",
                icon: "⚡",
              },
              {
                name: "Next.js 16",
                desc: "React-based frontend with App Router, specialist selection UI, interactive sample galleries, and a premium clinical-grade dark theme.",
                color: "#ffffff",
                icon: "⚛️",
              },
              {
                name: "Gemini 3.1 Flash Lite",
                desc: "Google's multimodal LLM receives domain-adapted prompts per specialist, visually verifying heatmaps and generating dual-persona clinical reports.",
                color: "#4285f4",
                icon: "💎",
              },
              {
                name: "Grad-CAM",
                desc: "Explainable AI technique generating visual heatmaps via specialist-specific convolutional layers — block7a_project_bn for colon, top_conv for brain.",
                color: "#e040fb",
                icon: "🔬",
              },
              {
                name: "Hugging Face Hub",
                desc: "Cloud-based model hosting for both specialists — Xpathology-Colon-Specialist and xpathology-brain-specialist — with versioned weights and calibration assets.",
                color: "#ffca28",
                icon: "🤗",
              },
            ].map((tech) => (
              <div
                key={tech.name}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "22px",
                  transition: "all 0.25s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${tech.color}33`;
                  e.currentTarget.style.background = `${tech.color}08`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>{tech.icon}</span>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "var(--fg)",
                    }}
                  >
                    {tech.name}
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--fg-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM & COMPANY*/}
        <section className="fade-up-4" style={{ marginBottom: "4rem" }}>
          <SectionLabel label="The Team" />

          {/* Developer Card */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "2rem 2.5rem",
                maxWidth: 420,
                width: "100%",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top glow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "40%",
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, var(--accent), transparent)",
                  borderRadius: "0 0 2px 2px",
                }}
              />

              {/* Avatar */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid rgba(0,210,150,0.3)",
                  margin: "0 auto 16px",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://github.com/Muhammad-Hassan12.png"
                  alt="Syed Muhammad Hassan"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--fg)",
                  marginBottom: 4,
                }}
              >
                Syed Muhammad Hassan
              </h3>

              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--accent)",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                Lead AI Engineer &amp; Full-Stack Developer
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  marginBottom: 20,
                }}
              >
                Co-Founder, AgenticEra Systems
              </p>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--fg-muted)",
                  lineHeight: 1.65,
                  marginBottom: 10,
                }}
              >
                A passionate programmer, expert in Deep Learning and Neural
                Networking. Driving the core AI pipeline — from model architecture
                to full-stack deployment.
              </p>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--fg-muted)",
                  lineHeight: 1.65,
                  marginBottom: 20,
                }}
              >
                Supercharged by <strong style={{ color: "var(--accent)" }}>Gemini 3.1 &amp; Antigravity</strong> as my AI coding partners.
              </p>

              {/* Social buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <a
                  href="https://github.com/Muhammad-Hassan12"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.2)";
                    e.currentTarget.style.color = "var(--fg)";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--fg-muted)";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)";
                  }}
                >
                  <GitHubIcon size={14} />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/syed-muhammad-hassan-aa112928b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(33,150,243,0.2)",
                    background: "rgba(33,150,243,0.06)",
                    color: "#64b5f6",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(33,150,243,0.35)";
                    e.currentTarget.style.background =
                      "rgba(33,150,243,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(33,150,243,0.2)";
                    e.currentTarget.style.background =
                      "rgba(33,150,243,0.06)";
                  }}
                >
                  <LinkedInIcon size={14} />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(0,210,150,0.03), rgba(33,150,243,0.03))",
              border: "1px solid rgba(0,210,150,0.12)",
              borderRadius: 16,
              padding: "2rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--accent)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Built By
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              <span className="gradient-text">AgenticEra Systems</span>
            </h3>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.7,
                maxWidth: 540,
                margin: "0 auto 20px",
              }}
            >
              Pioneering the intersection of agentic AI and real-world applications.
              From intelligent code assistants to medical diagnostics — we build AI
              systems that augment human expertise with precision and responsibility.
            </p>
            <a
              href="https://www.linkedin.com/company/AgenticEra-Systems"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 10,
                border: "1px solid rgba(33,150,243,0.25)",
                background: "rgba(33,150,243,0.08)",
                color: "#64b5f6",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
                letterSpacing: "0.04em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(33,150,243,0.14)";
                e.currentTarget.style.borderColor = "rgba(33,150,243,0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(33,150,243,0.08)";
                e.currentTarget.style.borderColor = "rgba(33,150,243,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <LinkedInIcon size={16} />
              Follow on LinkedIn
            </a>
          </div>
        </section>

        {/* SUPPORTED CLASSIFICATIONS*/}
        <section className="fade-up-5" style={{ marginBottom: "4rem" }}>
          <SectionLabel label="Colon Specialist — 9-Class Tissue Classification" />

          <p
            style={{
              fontSize: "0.84rem",
              color: "var(--fg-muted)",
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            The <strong style={{ color: "var(--fg)" }}>EfficientNetB1 Colon Specialist</strong> classifies H&amp;E-stained colorectal tissue patches
            into 9 distinct tissue categories. Only the <strong style={{ color: "#ff8080" }}>TUM</strong> class
            is considered clinically neoplastic (malignant).
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {[
              { code: "ADI", name: "Adipose Tissue", type: "Benign", desc: "Fat tissue surrounding the colon" },
              { code: "BACK", name: "Background", type: "Benign", desc: "Non-tissue background regions" },
              { code: "DEB", name: "Debris / Necrosis", type: "Benign", desc: "Cellular debris and necrotic tissue" },
              { code: "LYM", name: "Lymphocytes", type: "Benign", desc: "Immune cell aggregates and infiltrates" },
              { code: "MUC", name: "Mucus", type: "Benign", desc: "Mucinous secretions and pools" },
              { code: "MUS", name: "Smooth Muscle", type: "Benign", desc: "Muscularis propria / muscularis mucosae" },
              { code: "NORM", name: "Normal Colon Mucosa", type: "Benign", desc: "Healthy epithelial glandular tissue" },
              { code: "STR", name: "Cancer-Associated Stroma", type: "Benign", desc: "Desmoplastic stromal reaction tissue" },
              { code: "TUM", name: "Colorectal Adenocarcinoma", type: "Malignant", desc: "Tumour epithelium — neoplastic" },
            ].map((cls) => {
              const isMalignant = cls.type === "Malignant";
              return (
                <div
                  key={cls.code}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    border: `1px solid ${isMalignant ? "rgba(255,80,80,0.15)" : "rgba(0,210,150,0.15)"}`,
                    background: isMalignant
                      ? "rgba(255,80,80,0.03)"
                      : "rgba(0,210,150,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: isMalignant ? "#ff5050" : "var(--accent)",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        color: isMalignant ? "#ff8080" : "var(--accent)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {cls.code} · {cls.type}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginBottom: 4,
                    }}
                  >
                    {cls.name}
                  </p>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    {cls.desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Brain Specialist */}
          <SectionLabel label="Brain Specialist — 4-Class MRI Tumor Classification" />

          <p
            style={{
              fontSize: "0.84rem",
              color: "var(--fg-muted)",
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            The <strong style={{ color: "var(--fg)" }}>EfficientNetB0 Brain Specialist</strong> classifies T1-weighted axial brain MRI scans
            into 4 diagnostic categories. <strong style={{ color: "#ff8080" }}>Glioma</strong> is flagged as high concern,
            while <strong style={{ color: "#fbbf24" }}>meningioma</strong> and <strong style={{ color: "#fbbf24" }}>pituitary</strong> tumors
            are flagged as moderate concern.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { code: "glioma", name: "Glioma", type: "High Concern", desc: "Most aggressive primary brain tumor — morphologically heterogeneous across MRI slices", color: "#ff5050", borderColor: "rgba(255,80,80,0.15)", bgColor: "rgba(255,80,80,0.03)" },
              { code: "meningioma", name: "Meningioma", type: "Moderate Concern", desc: "Typically benign, arises from meninges — can overlap with glioma on 2D slices", color: "#fbbf24", borderColor: "rgba(251,191,36,0.15)", bgColor: "rgba(251,191,36,0.03)" },
              { code: "pituitary", name: "Pituitary Tumor", type: "Moderate Concern", desc: "Tumor of the pituitary gland in the sella turcica — lower-centre brain region", color: "#fbbf24", borderColor: "rgba(251,191,36,0.15)", bgColor: "rgba(251,191,36,0.03)" },
              { code: "notumor", name: "No Tumor Detected", type: "Clear", desc: "Normal brain MRI scan — no abnormal mass identified", color: "var(--accent)", borderColor: "rgba(0,210,150,0.15)", bgColor: "rgba(0,210,150,0.03)" },
            ].map((cls) => (
              <div
                key={cls.code}
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: `1px solid ${cls.borderColor}`,
                  background: cls.bgColor,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: cls.color,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: cls.color,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {cls.code} · {cls.type}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--fg)",
                    marginBottom: 4,
                  }}
                >
                  {cls.name}
                </p>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {cls.desc}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderRadius: 10,
              background: "rgba(251,191,36,0.04)",
              border: "1px solid rgba(251,191,36,0.12)",
              fontSize: "0.78rem",
              color: "var(--fg-muted)",
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: "#fbbf24" }}>Note on glioma recall (~78%):</strong>{" "}
            Glioma is the most morphologically heterogeneous class. The glioma↔meningioma confusion
            is consistent with published benchmarks on this dataset — both tumor types can present
            with overlapping MRI signal characteristics at 2D slice level. This was confirmed across
            four systematic training runs, confirming a dataset-level ceiling rather than a training failure.
          </div>
        </section>
      </main>
    </>
  );
}

// SECTION LABEL — reusable header for each section
function SectionLabel({ label }: { label: string }) {
  return (
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
          width: 3,
          height: 16,
          borderRadius: 2,
          background: "var(--accent)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--accent)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}
