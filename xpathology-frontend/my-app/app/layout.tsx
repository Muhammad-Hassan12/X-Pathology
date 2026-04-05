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
  title: "X-Pathology — AI-Assisted Oncology Screening",
  description:
    "Upload H&E stained histopathology slides for 5-class colon & lung cancer classification. Powered by MobileNetV2, Grad-CAM XAI, and Gemini dual-persona reporting. Built by AgenticEra Systems.",
  keywords: [
    "histopathology",
    "AI pathology",
    "cancer detection",
    "Grad-CAM",
    "MobileNetV2",
    "colon cancer",
    "lung cancer",
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
