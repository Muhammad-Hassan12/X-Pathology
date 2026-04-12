import type { Metadata } from "next";
import { Syne, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DisclaimerModal from "./components/DisclaimerModal";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X-Pathology — AI-Assisted Colorectal Oncology Screening",
  description:
    "Upload H&E stained colorectal histopathology patches for 9-class tissue classification. Powered by EfficientNetB1 with temperature-calibrated confidence, Grad-CAM XAI, and Gemini dual-persona clinical reporting. Built by AgenticEra Systems.",
  keywords: [
    "histopathology",
    "AI pathology",
    "cancer detection",
    "Grad-CAM",
    "EfficientNetB1",
    "colorectal cancer",
    "colon cancer",
    "temperature calibration",
    "computational pathology",
    "AgenticEra Systems",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <Footer />
        <DisclaimerModal />
      </body>
    </html>
  );
}
