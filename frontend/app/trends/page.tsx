"use client";

import Navbar from "@/components/Navbar";

import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
interface ScamRecord {
    hash: string;
    category: string;
    timestamp: number;
}

interface CategoryStat {
    label: string;
    count: number;
    color: string;
    pct: number;
}

// ── Category Color Map ────────────────────────────────────────────────────
const categoryColorMap: Record<string, string> = {
    "bank scam": "#FF2424", // neo-red
    "phishing": "#2D6BE4",  // neo-blue
    "job scam": "#FF6B35",  // neo-orange
    "lottery scam": "#FF3EAD", // neo-pink
    "courier scam": "#7B2FBE", // neo-purple
    "normal message": "#2ECC71", // neo-green
};

// ── Trends Dashboard Page ─────────────────────────────────────────────────
/**
 * Visualises scam detection statistics.
 * Phase 1: mock data displayed with CSS-only charts.
 * Next phase: real data from /scams endpoint + recharts.
 */
export default function TrendsPage() {
    const [scams, setScams] = useState<ScamRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/scams")
            .then((r) => r.json())
            .then((data) => {
                setScams(data.scams ?? []);
            })
            .catch(() => setError("Cannot reach backend."))
            .finally(() => setLoading(false));
    }, []);

    // ── Calculate Stats ───────────────────────────────────────────────────
    const totalScamsFlagged = scams.filter(s => s.category !== "normal message").length;
    const safeMessages = scams.filter(s => s.category === "normal message").length;
    const totalProcessed = scams.length;

    // Build the category array for the charts
    const categoryCounts: Record<string, number> = {};
    scams.forEach((s) => {
        if (s.category !== "normal message") {
            categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
        }
    });

    const categoriesArray: CategoryStat[] = Object.entries(categoryCounts)
        .map(([label, count]) => ({
            label,
            count,
            color: categoryColorMap[label] || "#000000",
            pct: totalScamsFlagged > 0 ? Math.round((count / totalScamsFlagged) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count); // highest first

    return (
        <main className="min-h-screen bg-white" style={{
            backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px"
        }}>
            <Navbar />

            <section className="max-w-4xl mx-auto px-6 pt-16 pb-16">
                {/* Header */}
                <div className="inline-block bg-neo-blue border-4 border-black shadow-[4px_4px_0px_0px_#000] px-4 py-2 text-sm font-black text-white mb-6 animate-pulse">
                    📡 LIVE NETWORK FEED
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                    Polygon Trends
                </h1>
                <p className="text-xl text-gray-700 font-bold mb-12 max-w-2xl leading-tight">
                    Real-time visual analysis of scam patterns archived on the <span className="bg-neo-yellow px-1 underline decoration-black underline-offset-4">Polygon Amoy Testnet</span>.
                </p>

                {error && (
                    <p className="neo-card p-4 text-neo-red font-bold mb-6">⚠️ {error}</p>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <p className="font-mono font-bold animate-pulse text-xl">Loading Blockchain Data…</p>
                    </div>
                ) : (
                    <>
                        {/* ── Stat cards ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatCard label="Ledger Size" value={totalProcessed.toString()} accent="bg-white" />
                            <StatCard label="Scams Blocked" value={totalScamsFlagged.toString()} accent="bg-neo-red" />
                            <StatCard label="Safe Traffic" value={safeMessages.toString()} accent="bg-neo-green" />
                        </div>

                        {/* ── Live Pulse Map ── */}
                        <div className="mb-12">
                            <LiveThreatMap scamCount={totalScamsFlagged} />
                        </div>

                        {totalProcessed === 0 ? (
                            <div className="neo-card p-10 text-center">
                                <p className="text-2xl font-black mb-2">No Data Yet</p>
                                <p className="text-gray-600">The Ledger is currently empty.</p>
                            </div>
                        ) : (
                            <>
                                {/* ── Category breakdown ── */}
                                <div className="neo-card p-8 bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                                    <h2 className="text-2xl font-black mb-8 uppercase tracking-widest border-b-4 border-black inline-block pb-1">Scam Categories</h2>

                                    {categoriesArray.length === 0 ? (
                                        <p className="font-mono text-gray-400">No scams detected yet. Only safe messages.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {categoriesArray.map((cat) => (
                                                <div key={cat.label} className="group">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-sm capitalize">{cat.label}</span>
                                                        <span className="font-mono text-sm font-bold">
                                                            {cat.count} &nbsp;
                                                            <span className="text-gray-400">({cat.pct}%)</span>
                                                        </span>
                                                    </div>
                                                    {/* Bar */}
                                                    <div className="w-full bg-gray-100 border-2 border-black h-7 relative overflow-hidden group-hover:shadow-sm transition-shadow">
                                                        <div
                                                            className="h-full transition-all duration-700"
                                                            style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ── Pie donut — CSS only ── */}
                                {categoriesArray.length > 0 && (
                                    <div className="mt-8 neo-card p-8 bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-12">
                                        <div className="relative w-56 h-56 shrink-0 hover:scale-105 transition-transform duration-300">
                                            {/* Build a conic-gradient "pie" */}
                                            <div
                                                className="w-full h-full rounded-full border-8 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                                                style={{
                                                    background: buildConicGradient(categoriesArray),
                                                }}
                                            />
                                            {/* centre hole */}
                                            <div className="absolute inset-[22%] bg-white rounded-full border-2 border-black flex items-center justify-center">
                                                <span className="text-xs font-black text-center leading-tight uppercase">
                                                    {totalScamsFlagged}<br />threats
                                                </span>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="space-y-3">
                                            {categoriesArray.map((cat) => (
                                                <div key={cat.label} className="flex items-center gap-3">
                                                    <span
                                                        className="w-5 h-5 border-2 border-black shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                                        style={{ backgroundColor: cat.color }}
                                                    />
                                                    <span className="font-black text-sm uppercase tracking-tight">
                                                        {cat.label} <span className="text-gray-500 font-bold ml-2">– {cat.pct}%</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

// ── Helper components ─────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className={`border-4 border-black p-6 transition-all hover:-translate-y-1 shadow-[8px_8px_0px_rgba(0,0,0,1)] ${accent}`}>
            <p className="text-sm font-black uppercase tracking-widest text-black/70 mb-1">{label}</p>
            <p className="text-6xl font-black text-black">{value}</p>
        </div>
    );
}

// ── Helper: build conic-gradient string from category array ──────────────
function buildConicGradient(
    cats: { color: string; pct: number }[]
): string {
    let angle = 0;
    const stops = cats.map((c) => {
        const start = angle;
        angle += c.pct * 3.6; // degrees
        return `${c.color} ${start}deg ${angle}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
}

// ── Live Threat Map Component ──────────────────────────────────────────────
function LiveThreatMap({ scamCount }: { scamCount: number }) {
    const [pings, setPings] = useState<{ id: number; top: string; left: string; color: string }[]>([]);

    useEffect(() => {
        if (scamCount === 0) return;

        // Generate a random ping every 1-3 seconds
        const interval = setInterval(() => {
            const newPing = {
                id: Date.now(),
                top: `${20 + Math.random() * 60}%`, // Keep roughly within map bounds
                left: `${10 + Math.random() * 80}%`,
                color: Math.random() > 0.3 ? "#FF2424" : "#FFDE59" // Mostly red (danger), some yellow (warning)
            };

            setPings(prev => [...prev.slice(-4), newPing]); // Keep only last 5 pings
        }, 2000 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, [scamCount]);

    return (
        <div className="neo-card bg-black border-4 border-black p-4 relative overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,1)] group">
            <h2 className="absolute top-6 left-6 text-white font-black text-xl uppercase tracking-widest z-10 flex items-center gap-2">
                <span className="w-3 h-3 bg-neo-red rounded-full animate-pulse block"></span>
                Global Threat Radar
            </h2>

            {/* The "Radar" Map Background */}
            <div className="w-full h-[400px] bg-[#0a0a0a] relative flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                {/* Grid lines */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(45, 107, 228, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 107, 228, 0.2) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Radar Sweep */}
                <div className="absolute w-[800px] h-[800px] rounded-full border border-neo-blue/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-neo-blue/10 origin-right"></div>
                </div>
                <div className="absolute w-[600px] h-[600px] rounded-full border border-neo-blue/30"></div>
                <div className="absolute w-[400px] h-[400px] rounded-full border border-neo-blue/40"></div>
                <div className="absolute w-[200px] h-[200px] rounded-full border border-neo-blue/50"></div>

                {/* Base SVG Map silhouette (Abstract world map dots) */}
                <svg className="absolute inset-0 w-full h-full text-neo-blue/20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="2" fill="currentColor" />
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
                </svg>

                {/* Live Pings */}
                {pings.map(ping => (
                    <div
                        key={ping.id}
                        className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 mix-blend-screen"
                        style={{ top: ping.top, left: ping.left, backgroundColor: ping.color }}
                    >
                        <div
                            className="absolute inset-0 rounded-full animate-ping opacity-75"
                            style={{ backgroundColor: ping.color, animationDuration: '2s' }}
                        ></div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-4 right-6 text-neo-blue font-mono text-xs uppercase z-10 font-bold opacity-60">
                Tracking nodes active // Scanning network packets...
            </div>
        </div>
    );
}
