"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
interface ScamRecord {
    hash: string;
    category: string;
    timestamp: number; // Unix timestamp
}

// ── Scam Ledger Page ──────────────────────────────────────────────────────
/**
 * Shows all scam records stored on the Polygon Amoy blockchain.
 */
export default function LedgerPage() {
    const [scams, setScams] = useState<ScamRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedScam, setSelectedScam] = useState<ScamRecord | null>(null);

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
        <main className="min-h-screen bg-white" style={{
            backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px"
        }}>
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
                    <div className="neo-card px-6 py-4 flex-1 min-w-[140px] bg-neo-green border-4 border-black shadow-[4px_4px_0px_0px_#000] text-black">
                        <p className="text-xs font-black uppercase tracking-widest text-black/60">Network Status</p>
                        <p className="text-lg font-black mt-1 animate-pulse">📡 SYNCED WITH POLYGON</p>
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
                    {scams.map((scam, idx) => (
                        <div
                            key={scam.hash + idx}
                            onClick={() => setSelectedScam(scam)}
                            className="neo-card p-4 flex items-center justify-between flex-wrap gap-3 cursor-pointer hover:-translate-y-1 hover:shadow-neo transition-all bg-white"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-mono text-sm font-bold truncate">
                                    {scam.hash.substring(0, 10)}...{scam.hash.slice(-8)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 font-bold">
                                    {new Date(scam.timestamp * 1000).toLocaleString('en-IN', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
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

            {/* Popup Modal */}
            {selectedScam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white border-4 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] max-w-lg w-full p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-black">Transaction Details</h2>
                            <button
                                onClick={() => setSelectedScam(null)}
                                className="text-gray-400 hover:text-black font-bold text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Scam Hash</p>
                                <div className="bg-gray-100 p-3 border-2 border-black font-mono text-sm break-all relative group">
                                    {selectedScam.hash}
                                    <button
                                        onClick={() => navigator.clipboard.writeText(selectedScam.hash)}
                                        className="absolute right-2 top-2 bg-white border-2 border-black text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 copy-btn hover:bg-black hover:text-white transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Category</p>
                                    <span className={`inline-block text-sm font-bold px-3 py-1 border-2 border-black ${categoryColor[selectedScam.category] ?? "bg-gray-200 text-black"}`}>
                                        {selectedScam.category}
                                    </span>
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Timestamp</p>
                                    <p className="text-sm font-bold">
                                        {new Date(selectedScam.timestamp * 1000).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-black mt-4">
                                <a
                                    href={`https://amoy.polygonscan.com/address/0xa31EdD87F321d76E6c5ad0c5E9294A95E8Fa100f`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full text-center neobrutal-button-blue shadow-none py-3 text-sm"
                                >
                                    View Ledger on PolygonScan ↗
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
