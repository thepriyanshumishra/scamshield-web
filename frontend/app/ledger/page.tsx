"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
interface ScamRecord {
    id: number;
    hash: string;
    category: string;
    created_at: string;
}

// ── Scam Ledger Page ──────────────────────────────────────────────────────
/**
 * Shows all scam records stored in the backend (SQLite).
 * In a future phase this will read from the Polygon blockchain directly.
 */
export default function LedgerPage() {
    const [scams, setScams] = useState<ScamRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/scams")
            .then((r) => r.json())
            .then((data) => {
                setScams(data.scams ?? []);
                setTotal(data.total ?? 0);
            })
            .catch(() => setError("Cannot reach backend."))
            .finally(() => setLoading(false));
    }, []);

    // ── Category badge colour map ──────────────────────────────────────────
    const categoryColor: Record<string, string> = {
        "bank scam": "bg-neo-red   text-white",
        "job scam": "bg-neo-orange text-white",
        "courier scam": "bg-neo-blue  text-white",
        "lottery scam": "bg-neo-pink  text-white",
        phishing: "bg-neo-purple text-white",
        "normal message": "bg-neo-green text-white",
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="max-w-4xl mx-auto px-6 pt-16 pb-10">
                {/* Header */}
                <div className="inline-block bg-neo-purple border-2 border-black shadow-neo px-3 py-1 text-sm font-bold text-white mb-4">
                    Blockchain Ledger
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">
                    ⛓️ Scam Ledger
                </h1>
                <p className="text-gray-600 font-medium mb-8">
                    Every scam flagged by ScamShield is fingerprinted and stored. Transparent. Immutable.
                </p>

                {/* Stats bar */}
                <div className="flex gap-4 mb-8 flex-wrap">
                    <div className="neo-card px-6 py-4 flex-1 min-w-[140px]">
                        <p className="text-xs font-bold uppercase text-gray-500">Total Scams Stored</p>
                        <p className="text-4xl font-black mt-1">{total}</p>
                    </div>
                    <div className="neo-card-yellow px-6 py-4 flex-1 min-w-[140px]">
                        <p className="text-xs font-bold uppercase">Status</p>
                        <p className="text-lg font-black mt-1">🔒 SQLite · Polygon soon</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="neo-card p-4 text-neo-red font-bold mb-6">⚠️ {error}</p>
                )}

                {/* Loading */}
                {loading && (
                    <p className="font-mono font-bold animate-pulse">Loading ledger…</p>
                )}

                {/* Scam list */}
                {!loading && scams.length === 0 && !error && (
                    <div className="neo-card p-8 text-center">
                        <p className="text-2xl font-black mb-2">Empty ledger 🎉</p>
                        <p className="text-gray-600 font-medium">
                            No scams stored yet. Detect a scam and add it to the chain.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {scams.map((scam) => (
                        <div
                            key={scam.id}
                            className="neo-card p-4 flex items-center justify-between flex-wrap gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-mono text-xs text-gray-500 truncate">
                                    #{scam.id} · {scam.hash}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(scam.created_at).toLocaleString()}
                                </p>
                            </div>
                            <span
                                className={`text-xs font-bold px-3 py-1 border-2 border-black ${categoryColor[scam.category] ?? "bg-gray-200 text-black"
                                    }`}
                            >
                                {scam.category}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
