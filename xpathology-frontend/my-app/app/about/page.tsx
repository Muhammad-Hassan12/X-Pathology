"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER — counts up when scrolled into view
   ═══════════════════════════════════════════════════════════════════════ */
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
        padding: "28px 16px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        animation: `fadeUp 0.5s ${delay}s ease both`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.4rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        <span className="gradient-text">
          {suffix === "MB" ? count.toFixed(1) : count}
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

/* ═══════════════════════════════════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════════
   PIPELINE STEP — for the "How It Works" section
   ═══════════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════════════════════════════ */
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
        {/* ═══════════════════════════════════════════════════════════════
           HERO
        ═══════════════════════════════════════════════════════════════ */}
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
            <span className="gradient-text">From Proof-of-Concept to Production</span>
          </h1>
          <p
            style={{
              maxWidth: 620,
              margin: "0 auto",
              fontSize: "0.88rem",
              color: "var(--fg-muted)",
              lineHeight: 1.7,
            }}
          >
            Building a reliable medical AI requires rigorous iteration.
            The X-Pathology pipeline underwent a significant architectural
            evolution to ensure the highest standards of inference speed,
            mathematical calibration, and diagnostic safety.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
           STATS BAR
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: "4rem",
          }}
        >
          <AnimatedStat value={5} suffix="" label="Tissue Classes" delay={0} />
          <AnimatedStat value={8.6} suffix="MB" label="Model Size" delay={0.1} />
          <AnimatedStat value={98} suffix="%" label="Accuracy" delay={0.2} />
          <AnimatedStat value={2} suffix="" label="Report Modes" delay={0.3} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
           VERSION TIMELINE
        ═══════════════════════════════════════════════════════════════ */}
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
            {/* Version badge */}
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>

          {/* Version 2.0 */}
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
            {/* Version badge */}
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
              Version 2.0: The Multiclass Optimization{" "}
              <span style={{ color: "var(--accent)", fontWeight: 400 }}>(MobileNetV2)</span>
            </h3>
            <p
              style={{
                fontSize: "0.84rem",
                color: "var(--fg-muted)",
                lineHeight: 1.75,
                marginBottom: 22,
              }}
            >
              To achieve enterprise-grade calibration, we completely re-architected the core visual
              engine. We transitioned to a highly optimized <strong style={{ color: "var(--fg)" }}>MobileNetV2</strong> backbone
              and expanded the diagnostic scope to a complex 5-class multi-organ model (covering
              both Colon and Lung histopathology).
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
                  title: "Precision Calibration",
                  desc: `Moving to a 5-class softmax output eliminated the binary saturation issue, forcing the model to learn highly specific, nuanced morphological features rather than relying on extreme edge weights.`,
                  accent: "var(--accent)",
                },
                {
                  num: "02",
                  title: "Radical Efficiency",
                  desc: "We reduced the model footprint from over 150MB down to an ultra-lightweight 8.6MB. This massive reduction in parameters allows for near-instantaneous inference and seamless cloud deployment without compromising our ~98% accuracy benchmark.",
                  accent: "var(--accent-blue)",
                },
                {
                  num: "03",
                  title: "Enhanced XAI Mapping",
                  desc: "The streamlined convolutional blocks of MobileNetV2 generate tighter, more precise Grad-CAM heatmaps, allowing the downstream LLM to analyze highly specific architectural aberrations.",
                  accent: "#a78bfa",
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

        {/* ═══════════════════════════════════════════════════════════════
           HOW IT WORKS — Pipeline
        ═══════════════════════════════════════════════════════════════ */}
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
              icon="📤"
              title="Upload H&E Slide"
              description="Upload a histopathology tissue section image (JPEG/PNG). The system accepts standard H&E stained slides from colon and lung biopsies."
              delay={0.1}
            />
            <PipelineStep
              step={2}
              icon="🧠"
              title="MobileNetV2 CNN Inference"
              description="The optimized MobileNetV2 model classifies the tissue into one of 5 categories: Colon Adenocarcinoma, Colon Benign, Lung Adenocarcinoma, Lung Benign, or Lung Squamous Cell Carcinoma."
              delay={0.2}
            />
            <PipelineStep
              step={3}
              icon="🔥"
              title="Grad-CAM XAI Heatmap"
              description="Gradient-weighted Class Activation Mapping generates a visual explanation of which cellular structures the CNN focused on. Red/yellow regions indicate high attention areas."
              delay={0.3}
            />
            <PipelineStep
              step={4}
              icon="✨"
              title="Gemini LLM Analysis"
              description="Both the original slide and the Grad-CAM overlay are sent to Google's Gemini API, which generates a dual-persona report with clinical and patient-friendly sections."
              delay={0.4}
            />
            <PipelineStep
              step={5}
              icon="📋"
              title="Dual-Persona Report"
              description="The final output includes a clinical pathology report for professionals and a compassionate plain-English summary for patients, along with confidence scores and visual explanations."
              isLast
              delay={0.5}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
           TECH STACK
        ═══════════════════════════════════════════════════════════════ */}
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
                desc: "Deep learning backbone powering the MobileNetV2 fine-tuned model for 5-class histopathology classification.",
                color: "#ff6f00",
                icon: "🧪",
              },
              {
                name: "FastAPI",
                desc: "High-performance async Python backend handling image preprocessing, CNN inference, and Grad-CAM generation.",
                color: "#009688",
                icon: "⚡",
              },
              {
                name: "Next.js 16",
                desc: "React-based frontend framework with App Router, providing the clinical-grade dark UI with server-side rendering.",
                color: "#ffffff",
                icon: "⚛️",
              },
              {
                name: "Gemini API",
                desc: "Google's multimodal LLM that analyzes both the slide and heatmap to produce dual-persona clinical reports.",
                color: "#4285f4",
                icon: "💎",
              },
              {
                name: "Grad-CAM",
                desc: "Explainable AI technique generating visual heatmaps of CNN attention, making model decisions interpretable for clinicians.",
                color: "#e040fb",
                icon: "🔬",
              },
              {
                name: "Hugging Face Hub",
                desc: "Cloud-based model hosting and versioning, enabling seamless model downloads and deployment across environments.",
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

        {/* ═══════════════════════════════════════════════════════════════
           TEAM & COMPANY
        ═══════════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════════
            SUPPORTED CLASSIFICATIONS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="fade-up-5" style={{ marginBottom: "2rem" }}>
          <SectionLabel label="Supported Classifications" />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { name: "Colon Adenocarcinoma", type: "Malignant", organ: "Colon" },
              { name: "Colon Benign Tissue", type: "Benign", organ: "Colon" },
              { name: "Lung Adenocarcinoma", type: "Malignant", organ: "Lung" },
              { name: "Lung Benign Tissue", type: "Benign", organ: "Lung" },
              { name: "Lung Squamous Cell Carcinoma", type: "Malignant", organ: "Lung" },
            ].map((cls) => {
              const isMalignant = cls.type === "Malignant";
              return (
                <div
                  key={cls.name}
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
                      {cls.type}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--fg)",
                      marginBottom: 2,
                    }}
                  >
                    {cls.name}
                  </p>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: "var(--muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {cls.organ} Histopathology
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION LABEL — reusable header for each section
   ═══════════════════════════════════════════════════════════════════════ */
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
