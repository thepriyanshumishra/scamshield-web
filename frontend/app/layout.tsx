import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import LiveThreatToast from "@/components/LiveThreatToast";
import GlobalStatsBanner from "@/components/GlobalStatsBanner";
import Footer from "@/components/Footer";

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
  keywords: ["scam detector", "AI", "blockchain", "phishing", "fraud", "cybersecurity", "web3"],
  authors: [{ name: "ScamShield Network" }],
  creator: "ScamShield Network",
  publisher: "ScamShield Network",
  metadataBase: new URL("https://scamshield.example.com"), // Update this when deployed
  openGraph: {
    title: "ScamShield — AI Scam Detector",
    description: "Detect scams instantly using AI + blockchain. Protect yourself from phishing, job scams, and fraud.",
    url: "https://scamshield.example.com",
    siteName: "ScamShield",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ScamShield Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScamShield — AI Scam Detector",
    description: "Detect scams instantly using AI + blockchain. Protect yourself from phishing, job scams, and fraud.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased bg-white text-black min-h-screen flex flex-col`}
      >
        <GlobalStatsBanner />
        <div className="flex-1 w-full">
          {children}
        </div>
        <LiveThreatToast />
        <Footer />
      </body>
    </html>
  );
}
