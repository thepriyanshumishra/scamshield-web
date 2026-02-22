"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

// ── Home Page — Scam Detection ────────────────────────────────────────────
/**
 * Main page of ScamShield.
 * Users can paste a text message or upload a screenshot.
 * AI returns: probability, category, red flags, safety advice.
 * Phase 1: UI + mock data wired to backend placeholder endpoints.
 */
export default function Home() {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (!message.trim() && !imageFile) {
      setError("Paste a message or upload an image first.");
      return;
    }

    setLoading(true);
    try {
      if (imageFile) {
        // Image path
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("http://127.0.0.1:8000/analyze-image", {
          method: "POST",
          body: formData,
        });
        setResult(await res.json());
      } else {
        // Text path
        const res = await fetch("http://127.0.0.1:8000/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        setResult(await res.json());
      }
    } catch {
      setError("Cannot reach backend. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStoreOnBlockchain() {
    if (!result) return;
    const hash = await sha256(message || "image");
    await fetch("http://127.0.0.1:8000/store-scam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_hash: hash, category: result.category }),
    });
    alert("✅ Scam hash stored in the ledger!");
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <div className="inline-block bg-neo-yellow border-2 border-black shadow-neo px-3 py-1 text-sm font-bold mb-4">
          AI + Web3 Powered
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-none mb-4 tracking-tighter">
          Detect scams instantly using AI
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Paste any suspicious message or upload a screenshot. ScamShield analyses it using AI in under a second.
        </p>
      </section>

      {/* ── Input area ── */}
      <section className="max-w-3xl mx-auto px-6 pb-10 space-y-4">
        {/* Message textarea */}
        <div>
          <label className="block font-bold mb-1 text-sm">
            Paste suspicious message
          </label>
          <textarea
            id="message-input"
            rows={5}
            placeholder="e.g. Congratulations! Your bank account has been selected for a ₹50,000 reward. Share your OTP to claim..."
            value={message}
            onChange={(e) => { setMessage(e.target.value); setImageFile(null); }}
            className="
              w-full p-4 font-mono text-sm
              border-2 border-black shadow-neo
              focus:outline-none focus:shadow-neo-yellow
              resize-none
            "
          />
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t-2 border-black" />
          <span className="font-bold text-sm">OR</span>
          <div className="flex-1 border-t-2 border-black" />
        </div>

        {/* Image upload */}
        <div>
          <label className="block font-bold mb-1 text-sm">
            Upload screenshot
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); setMessage(""); }}
            className="
              w-full border-2 border-black p-3 font-mono text-sm
              file:mr-4 file:py-2 file:px-4
              file:border-2 file:border-black file:font-bold
              file:bg-neo-yellow file:cursor-pointer
              cursor-pointer
            "
          />
          {imageFile && (
            <p className="text-sm font-mono mt-1">
              📎 {imageFile.name}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="neo-card border-neo-red p-3 text-neo-red font-bold text-sm">
            ⚠️ {error}
          </p>
        )}

        {/* Analyze button */}
        <button
          id="analyze-button"
          onClick={handleAnalyze}
          disabled={loading}
          className="btn-neo w-full py-4 text-lg disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "⚡ Analyze Now"}
        </button>
      </section>

      {/* ── Result card ── */}
      {result && (
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <ResultCard result={result} onStore={handleStoreOnBlockchain} />
        </section>
      )}
    </main>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────
interface AnalysisResult {
  probability: number;
  category: string;
  red_flags: string[];
  advice: string;
}

// ── Result Card component ─────────────────────────────────────────────────
function ResultCard({
  result,
  onStore,
}: {
  result: AnalysisResult;
  onStore: () => void;
}) {
  const pct = Math.round(result.probability * 100);
  const isScam = pct >= 50;

  return (
    <div className={`neo-card p-6 space-y-5 ${isScam ? "shadow-neo-red border-neo-red" : "shadow-neo-green border-neo-green"}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-black">
          {isScam ? "🚨 Scam Detected" : "✅ Looks Safe"}
        </h2>
        <span
          className={`text-3xl font-black px-4 py-2 border-2 border-black shadow-neo-sm ${isScam ? "bg-neo-red text-white" : "bg-neo-green text-white"
            }`}
        >
          {pct}% scam
        </span>
      </div>

      {/* Category */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Category
        </span>
        <p className="font-bold text-lg capitalize mt-0.5">{result.category}</p>
      </div>

      {/* Red flags */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Red Flags
        </span>
        <ul className="mt-1 space-y-1">
          {result.red_flags.map((flag, i) => (
            <li key={i} className="flex gap-2 text-sm font-medium">
              <span className="text-neo-red font-bold">▸</span> {flag}
            </li>
          ))}
        </ul>
      </div>

      {/* Advice */}
      <div className="bg-neo-yellow border-2 border-black p-4 shadow-neo-sm">
        <span className="text-xs font-bold uppercase tracking-wider">
          Safety Advice
        </span>
        <p className="mt-1 text-sm font-semibold">{result.advice}</p>
      </div>

      {/* Add to blockchain */}
      {isScam && (
        <button
          id="store-blockchain-button"
          onClick={onStore}
          className="btn-neo-red w-full"
        >
          ⛓️ Add to Blockchain Ledger
        </button>
      )}
    </div>
  );
}

// ── Utility: SHA-256 hash ─────────────────────────────────────────────────
async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
