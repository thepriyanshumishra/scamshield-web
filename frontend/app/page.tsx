"use client";

import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import LocalHistory from "@/components/LocalHistory";
import { useState } from "react";
import jsQR from "jsqr";

// ── Types ─────────────────────────────────────────────────────────────────
interface HighlightedPhrase {
  phrase: string;
  danger: "high" | "medium";
}

interface AnalysisResult {
  probability: number;
  category: string;
  red_flags: string[];
  highlighted_phrases?: HighlightedPhrase[];
  psychology_explainer?: string;
  advice: string;
  extracted_text?: string;
}

// ── Home Page — Scam Detection ────────────────────────────────────────────
export default function Home() {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setMessage("");
    setResult(null);
    setError("");

    // Create a local URL for the thumbnail preview
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Attempt QR extraction
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            console.log("QR Code detected:", code.data);
            // It's a QR code! Swap to text extraction mode
            setMessage(code.data);
            setImageFile(null); // We don't need to send the image to backend OCR anymore
            setError("QR Code detected and text extracted automatically.");
          }
        }
      };
      img.src = url;
    } else {
      setImagePreview(null);
    }
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
  }

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (!message.trim() && !imageFile) {
      setError("Paste a message or upload an image first.");
      return;
    }

    setLoading(true);
    let finalResult = null;

    let res: Response;
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        res = await fetch("http://127.0.0.1:8000/analyze-image", {
          method: "POST",
          body: formData,
        });
      } else {
        // Check if message is a URL
        const isUrl = /^(https?:\/\/)/i.test(message.trim());

        if (isUrl) {
          res = await fetch("http://127.0.0.1:8000/analyze-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: message.trim() }),
          });
        } else {
          res = await fetch("http://127.0.0.1:8000/analyze-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          });
        }
      }

      finalResult = await res.json();
      if (!res.ok) {
        const errorMsg = finalResult.detail
          ? (typeof finalResult.detail === 'string' ? finalResult.detail : JSON.stringify(finalResult.detail))
          : "Unknown error from server";
        throw new Error(errorMsg);
      }

      // ── Defensive checks ──
      if (!finalResult.red_flags) finalResult.red_flags = [];
      if (!finalResult.highlighted_phrases) finalResult.highlighted_phrases = [];

      // ── WHATSAPP FORWARD DETECTOR ──
      // If the user pasted a message starting with WhatsApp's notorious "Forwarded" tag,
      // we immediately flag it, even if the AI missed it.
      if (message) {
        const lowerMsg = message.trim().toLowerCase();
        if (lowerMsg.startsWith("forwarded") || lowerMsg.includes("forwarded many times")) {
          if (!finalResult.red_flags.includes("Mass-forwarded message pattern detected")) {
            finalResult.red_flags.unshift("Mass-forwarded WhatsApp pattern detected");
            // Bump probability slightly if it's a forward
            finalResult.probability = Math.min(finalResult.probability + 0.15, 0.99);
          }
        }
      }

      setResult(finalResult);

      // ── SAVE TO LOCAL HISTORY ──
      try {
        const historyStr = localStorage.getItem("scamshield_history");
        let history = historyStr ? JSON.parse(historyStr) : [];
        history.unshift({
          timestamp: new Date().toISOString(),
          message: message || imageFile?.name || "Image upload",
          category: finalResult.category,
          probability: finalResult.probability,
        });
        // Keep only last 5
        history = history.slice(0, 5);
        localStorage.setItem("scamshield_history", JSON.stringify(history));
        // dispatch custom event so other components can re-render
        window.dispatchEvent(new Event("historyUpdated"));
      } catch (e) {
        console.error("Local storage error", e);
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "Failed to fetch") {
        setError("Error: " + err.message);
      } else {
        setError("Cannot reach backend. Make sure FastAPI is running on port 8000.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStoreOnBlockchain() {
    if (!result) return;

    // ── FIX: Normalize the raw message BEFORE hashing. ────────────────────
    // BEFORE (buggy): sha256(message) — any trailing space, case difference,
    //   or extra newline from copy-paste would produce a completely different hash.
    // AFTER  (fixed): normalizeForHash(message) — deterministic regardless of
    //   cosmetic differences in whitespace/casing. The hash now depends only on
    //   the semantic content, making it fully reproducible.
    const rawInput = message || imageFile?.name || "image";
    const normalized = normalizeForHash(rawInput);

    // Console log so you can verify the normalized string during demos.
    // Two identical messages should always log the exact same string here.
    console.log("[ScamShield] Hashing normalized input:", JSON.stringify(normalized));

    const hash = await sha256(normalized);
    console.log("[ScamShield] Generated hash:", hash);

    try {
      const res = await fetch("http://127.0.0.1:8000/store-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_hash: hash, category: result.category }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Unknown server error" }));
        alert(`❌ Blockchain storage failed:\n\n${errorData.detail}`);
        return;
      }

      alert("✅ Scam hash stored in the ledger!");
    } catch {
      alert("❌ Cannot reach backend. Make sure FastAPI is running on port 8000.");
    }
  }


  return (
    <main className="min-h-screen bg-white" style={{
      backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
      backgroundSize: "30px 30px"
    }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <div className="inline-block bg-neo-yellow border-2 border-black shadow-neo px-3 py-1 text-sm font-bold mb-4">
          AI + Web3 Powered
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6 tracking-tighter text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
          Detect scams instantly using AI
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Paste any suspicious message or upload a screenshot. ScamShield analyses it in under a second.
        </p>
      </section>

      {/* ── Input area ── */}
      <section className="max-w-3xl mx-auto px-6 pb-10 space-y-4">
        {/* Message textarea */}
        <div>
          <label className="block font-bold mb-1 text-sm">Paste suspicious message or URL</label>
          <textarea
            id="message-input"
            rows={5}
            placeholder="e.g. Congratulations! Your bank account has... OR https://suspicious-website.com"
            value={message}
            onChange={handleMessageChange}
            className="w-full p-4 font-mono text-sm border-2 border-black shadow-neo hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all focus:outline-none focus:-translate-y-1 focus:shadow-[6px_6px_0px_rgba(0,0,0,1)] resize-none"
          />
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t-2 border-black" />
          <span className="font-bold text-sm">OR</span>
          <div className="flex-1 border-t-2 border-black" />
        </div>

        {/* Image upload + preview */}
        <div>
          <label className="block font-bold mb-1 text-sm">Upload screenshot</label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border-2 border-black p-3 font-mono text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all bg-white file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:font-bold file:bg-neo-yellow file:cursor-pointer cursor-pointer"
          />

          {/* Thumbnail preview */}
          {imagePreview && (
            <div className="mt-3 border-2 border-black shadow-neo inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Selected screenshot preview"
                className="max-h-48 max-w-full block"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="border-2 border-black p-3 text-neo-red font-bold text-sm bg-white">
            ⚠️ {error}
          </p>
        )}

        {/* Analyze button */}
        <button
          id="analyze-button"
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-neo-yellow text-black border-4 border-black p-5 text-xl font-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
        >
          {loading ? "Analyzing…" : "⚡ Analyze Message Now"}
        </button>
      </section>

      {/* ── Result card ── */}
      {result ? (
        <section className="max-w-3xl mx-auto px-6 pb-16 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <ResultCard result={result} onStore={handleStoreOnBlockchain} originalMessage={message} />
        </section>
      ) : (
        <HowItWorks />
      )}

      {/* ── Local History ── */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <LocalHistory />
      </section>
    </main>
  );
}

// ── Highlighted Message Component ─────────────────────────────────────────
function HighlightedMessage({
  text,
  phrases,
}: {
  text: string;
  phrases: HighlightedPhrase[];
}) {
  if (!phrases || phrases.length === 0) return <span>{text}</span>;

  const escaped = phrases
    .map((p) => p.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const match = phrases.find(
          (p) => p.phrase.toLowerCase() === part.toLowerCase()
        );
        if (!match) return <span key={i}>{part}</span>;
        if (match.danger === "high") {
          return (
            <mark key={i} className="bg-red-200 text-red-900 font-black px-0.5 rounded-sm border border-red-400 not-italic" title="⚠️ High danger">
              {part}
            </mark>
          );
        }
        return (
          <mark key={i} className="bg-orange-200 text-orange-900 font-bold px-0.5 rounded-sm border border-orange-400 not-italic" title="⚠️ Medium risk">
            {part}
          </mark>
        );
      })}
    </>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────
function ResultCard({
  result,
  onStore,
  originalMessage,
}: {
  result: AnalysisResult;
  onStore: () => void;
  originalMessage: string;
}) {
  const pct = Math.round(result.probability * 100);
  const isScam = pct >= 50;
  const [showOcrText, setShowOcrText] = useState(false);

  const threatBarColor =
    pct >= 76 ? "bg-neo-red" : pct >= 46 ? "bg-neo-orange" : "bg-neo-green";
  const cardBorder = isScam
    ? "border-neo-red shadow-[12px_12px_0px_rgba(255,36,36,0.5)]"
    : "border-neo-green shadow-[12px_12px_0px_rgba(0,204,102,0.4)]";

  const displayText = originalMessage || result.extracted_text || "";
  const phrases = result.highlighted_phrases || [];

  return (
    <div className={`bg-white border-4 p-0 overflow-hidden ${cardBorder}`}>

      {/* ── Header Banner ── */}
      <div className={`px-8 py-5 flex items-center justify-between flex-wrap gap-4 border-b-4 border-black ${isScam ? "bg-red-50" : "bg-green-50"}`}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-0.5">ScamShield AI · Analysis Complete</p>
          <h2 className={`text-3xl font-black tracking-tighter ${isScam ? "text-neo-red" : "text-neo-green"}`}>
            {isScam ? "🚨 SCAM DETECTED" : "✅ LOOKS SAFE"}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-0.5">Threat Score</p>
          <p className={`text-5xl font-black leading-none ${isScam ? "text-neo-red" : "text-neo-green"}`}>
            {pct}<span className="text-lg font-bold">%</span>
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* ── Threat Meter ── */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Threat Level</span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border border-black ${pct >= 76 ? "bg-neo-red text-white" : pct >= 50 ? "bg-neo-orange text-white" : "bg-neo-green text-white"
              }`}>
              {pct < 26 ? "LOW" : pct < 50 ? "MODERATE" : pct < 76 ? "HIGH" : "CRITICAL"}
            </span>
          </div>
          <div className="w-full bg-gray-200 border-2 border-black h-6 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${threatBarColor}`}
              style={{ width: `${pct}%` }}
            />
            {[25, 50, 75].map(tick => (
              <div key={tick} className="absolute top-0 h-full w-px bg-black/20" style={{ left: `${tick}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1 px-0.5">
            <span>SAFE</span><span>CAUTION</span><span>DANGER</span><span>CRITICAL</span>
          </div>
        </div>

        {/* ── Category chip ── */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Category</span>
          <span className={`border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,1)] ${isScam ? "bg-neo-red text-white" : "bg-neo-green text-white"
            }`}>
            {result.category}
          </span>
        </div>

        {/* ── Analyzed Message with Highlights ── */}
        {displayText && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Analyzed Message</p>
            <div className="border-2 border-black bg-gray-50 p-4 font-mono text-sm leading-relaxed break-words">
              <HighlightedMessage text={displayText} phrases={phrases} />
            </div>
            {phrases.length > 0 && (
              <div className="flex items-center gap-5 mt-2 text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-3 h-3 bg-red-200 border border-red-400 rounded-sm" /> High danger
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-3 h-3 bg-orange-200 border border-orange-400 rounded-sm" /> Medium risk
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Red Flag Chips ── */}
        {result.red_flags.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Red Flags Detected</p>
            <div className="flex flex-wrap gap-2">
              {result.red_flags.map((flag, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-red-50 text-red-900 border-2 border-neo-red px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_rgba(255,36,36,1)]">
                  <span>⚠️</span> {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── The Attacker's Mirror (Psychology) ── */}
        {isScam && result.psychology_explainer && !result.psychology_explainer.toLowerCase().includes("no psychological manipulation") && (
          <div className="bg-black text-white border-4 border-black p-5 shadow-[6px_6px_0px_rgba(255,222,89,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 text-neo-yellow">🧠 The Attacker's Mirror</p>
            <p className="text-base font-bold leading-snug font-mono text-gray-200">
              {result.psychology_explainer}
            </p>
          </div>
        )}

        {/* ── Safety Advice ── */}
        <div className="bg-neo-yellow border-4 border-black p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2">🛡️ Safety Advice</p>
          <p className="text-base font-bold leading-snug">{result.advice}</p>
        </div>

        {/* ── OCR accordion ── */}
        {result.extracted_text && !result.extracted_text.startsWith("[") && (
          <div className="border-2 border-black">
            <button
              onClick={() => setShowOcrText((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm bg-gray-50 hover:bg-neo-yellow transition-colors"
            >
              <span>{/^(https?:\/\/)/i.test((originalMessage || "").trim()) ? "📝 Scraped Web Content" : "📝 Text extracted from image"}</span>
              <span>{showOcrText ? "▲ Hide" : "▼ Show"}</span>
            </button>
            {showOcrText && (
              <pre className="p-4 font-mono text-xs whitespace-pre-wrap bg-white border-t-2 border-black max-h-48 overflow-y-auto">
                {result.extracted_text}
              </pre>
            )}
          </div>
        )}

        {/* ── CTA Buttons ── */}
        <div className="flex gap-4 flex-col sm:flex-row pt-4 border-t-4 border-black">
          {/* Share/Copy utilities (available for both safe & scam) */}
          <div className="flex flex-1 gap-2">
            <button
              onClick={() => {
                const text = `ScamShield detected a ${isScam ? 'High Risk Scam' : 'Safe Message'}!\nCategory: ${result.category}\nScore: ${pct}%\nAdvice: ${result.advice}`;
                if (navigator.share) {
                  navigator.share({ title: 'ScamShield Analysis', text });
                } else {
                  navigator.clipboard.writeText(text);
                  alert("✅ Result copied to clipboard!");
                }
              }}
              className="bg-gray-100 text-black border-4 border-black font-black py-4 flex-1 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs lg:text-sm uppercase tracking-widest text-center"
            >
              📤 Share
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayText);
                alert("✅ Original message copied!");
              }}
              className="bg-gray-100 text-black border-4 border-black font-black py-4 flex-1 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs lg:text-sm uppercase tracking-widest text-center"
            >
              📋 Copy Raw
            </button>
          </div>

          {/* Scam-specific utilities */}
          {isScam && (
            <div className="flex flex-1 gap-2">
              <button
                id="store-blockchain-button"
                onClick={onStore}
                className="bg-[#FFDE59] text-black border-4 border-black font-black py-4 flex-1 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs lg:text-sm uppercase tracking-widest"
              >
                ⛓️ Add to Ledger
              </button>
              <button
                onClick={() => window.print()}
                className="bg-white text-black border-4 border-black font-black py-4 flex-1 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs lg:text-sm uppercase tracking-widest"
              >
                🖨️ Print Report
              </button>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center bg-neo-red text-white border-4 border-black font-black py-4 flex-1 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs lg:text-sm uppercase tracking-widest"
              >
                🚨 Report Crime
              </a>
            </div>
          )}
        </div>

        {/* ── Print-only Police Report ── */}
        {isScam && (
          <div className="hidden print:block absolute top-0 left-0 w-full bg-white p-10 font-mono text-black">
            <div className="border-4 border-black p-8 mb-8">
              <h1 className="text-4xl font-black uppercase mb-2 border-b-4 border-black pb-4">Cyber Security Incident Report</h1>
              <div className="flex justify-between font-bold mt-4">
                <p>System: ScamShield AI Scanner</p>
                <p>Date: {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-black bg-black text-white inline-block px-3 py-1 mb-2">1. Classification</h2>
              <div className="border-2 border-black p-4"><p><strong>Category:</strong> {result.category}</p><p><strong>Threat Score:</strong> {pct}%</p></div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-black bg-black text-white inline-block px-3 py-1 mb-2">2. Red Flags</h2>
              <ul className="border-2 border-black p-4 list-disc list-inside space-y-2">{result.red_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-black bg-black text-white inline-block px-3 py-1 mb-2">3. Evidence</h2>
              <div className="border-2 border-black p-4 whitespace-pre-wrap break-words">{displayText}</div>
            </div>
            <div className="mt-16 text-center text-sm font-bold opacity-60">
              <p>Generated by ScamShield Network • Blockchain Immutable Registry</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hash Normalization ────────────────────────────────────────────────────
// WHY: Cryptographic hash functions are deterministic — same input = same
// output. But if the raw message string contains hidden differences (trailing
// spaces, different casing, extra newlines from copy-paste), the hash changes.
// WHAT: We normalize to a canonical form BEFORE hashing so that
// semantically identical messages always produce the identical SHA-256 hash.
function normalizeForHash(text: string): string {
  return text
    .trim()           // remove leading/trailing whitespace
    .toLowerCase()    // case-insensitive — "OTP" and "otp" are the same message
    .replace(/\s+/g, " "); // collapse all whitespace (spaces, tabs, newlines) to a single space
}

// ── SHA-256 utility ───────────────────────────────────────────────────────
// Pure function — same string in always produces the same hex digest out.
// Non-determinism was upstream (un-normalized input), NOT here.
async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
