import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import LiveThreatToast from "@/components/LiveThreatToast";

// ── Fonts ────────────────────────────────────────────────────────────────
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

// ── Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "ScamShield — AI Scam Detector",
  description:
    "Detect scam messages instantly with AI. Store scam fingerprints on blockchain. Free, fast, and open.",
  keywords: ["scam detector", "AI", "blockchain", "phishing", "fraud"],
  openGraph: {
    title: "ScamShield — AI Scam Detector",
    description: "Detect scams instantly using AI + blockchain.",
    type: "website",
  },
};

// ── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased bg-white text-black min-h-screen`}
      >
        {children}
        <LiveThreatToast />
      </body>
    </html>
  );
}
