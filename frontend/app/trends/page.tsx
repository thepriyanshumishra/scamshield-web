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
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="max-w-4xl mx-auto px-6 pt-16 pb-16">
                {/* Header */}
                <div className="inline-block bg-neo-blue border-2 border-black shadow-neo px-3 py-1 text-sm font-bold text-white mb-4">
                    Live Dashboard
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">
                    📊 Polygon Trends
                </h1>
                <p className="text-gray-600 font-medium mb-8">
                    Visualise scam patterns stored immutably on the Polygon Amoy testnet.
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            <StatCard label="Total Stored" value={totalProcessed.toString()} accent="bg-neo-yellow" />
                            <StatCard label="Scams Caught" value={totalScamsFlagged.toString()} accent="bg-neo-red text-white" />
                            <StatCard label="Safe Messages" value={safeMessages.toString()} accent="bg-neo-green text-white" />
                        </div>

                        {totalProcessed === 0 ? (
                            <div className="neo-card p-10 text-center">
                                <p className="text-2xl font-black mb-2">No Data Yet</p>
                                <p className="text-gray-600">The Ledger is currently empty.</p>
                            </div>
                        ) : (
                            <>
                                {/* ── Category breakdown ── */}
                                <div className="neo-card p-6 shadow-neo transition-all hover:-translate-y-1">
                                    <h2 className="text-xl font-black mb-5">Scam Categories</h2>

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
                                    <div className="mt-8 neo-card p-6 shadow-neo transition-all hover:-translate-y-1 flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative w-44 h-44 shrink-0 hover:scale-105 transition-transform duration-300">
                                            {/* Build a conic-gradient "pie" */}
                                            <div
                                                className="w-full h-full rounded-full border-4 border-black shadow-neo"
                                                style={{
                                                    background: buildConicGradient(categoriesArray),
                                                }}
                                            />
                                            {/* centre hole */}
                                            <div className="absolute inset-[22%] bg-white rounded-full border-2 border-black flex items-center justify-center">
                                                <span className="text-xs font-black text-center leading-tight">
                                                    {totalScamsFlagged}<br />scans
                                                </span>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="space-y-2">
                                            {categoriesArray.map((cat) => (
                                                <div key={cat.label} className="flex items-center gap-3">
                                                    <span
                                                        className="w-4 h-4 border-2 border-black shrink-0"
                                                        style={{ backgroundColor: cat.color }}
                                                    />
                                                    <span className="font-bold text-sm capitalize">
                                                        {cat.label} <span className="text-gray-500 font-normal truncate">– {cat.pct}%</span>
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
        <div className={`neo-card p-5 transition-transform hover:-translate-y-1 cursor-default ${accent}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-90">{label}</p>
            <p className="text-4xl font-black mt-1 drop-shadow-sm">{value}</p>
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
