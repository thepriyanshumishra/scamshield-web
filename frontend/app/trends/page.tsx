"use client";

import Navbar from "@/components/Navbar";

// ── Mock data (will be replaced with real API data in next phase) ──────────
const MOCK_TOTAL_SCANS = 1247;

const MOCK_CATEGORIES = [
    { label: "Bank Scam", count: 420, color: "#FF2424", pct: 34 },
    { label: "Phishing", count: 310, color: "#2D6BE4", pct: 25 },
    { label: "Job Scam", count: 215, color: "#FF6B35", pct: 17 },
    { label: "Lottery Scam", count: 180, color: "#FF3EAD", pct: 14 },
    { label: "Courier Scam", count: 122, color: "#7B2FBE", pct: 10 },
];

// ── Trends Dashboard Page ─────────────────────────────────────────────────
/**
 * Visualises scam detection statistics.
 * Phase 1: mock data displayed with CSS-only charts.
 * Next phase: real data from /scams endpoint + recharts.
 */
export default function TrendsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="max-w-4xl mx-auto px-6 pt-16 pb-16">
                {/* Header */}
                <div className="inline-block bg-neo-blue border-2 border-black shadow-neo px-3 py-1 text-sm font-bold text-white mb-4">
                    Trends Dashboard
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">
                    📊 Scam Trends
                </h1>
                <p className="text-gray-600 font-medium mb-8">
                    Visualise scam patterns in real time. Currently showing demo data — live data in next phase.
                </p>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                    <StatCard label="Total Scans" value={MOCK_TOTAL_SCANS.toLocaleString()} accent="bg-neo-yellow" />
                    <StatCard label="Scams Caught" value="1,022" accent="bg-neo-red text-white" />
                    <StatCard label="Safe Messages" value="225" accent="bg-neo-green text-white" />
                </div>

                {/* ── Category breakdown ── */}
                <div className="neo-card p-6">
                    <h2 className="text-xl font-black mb-5">Scam Categories</h2>

                    <div className="space-y-4">
                        {MOCK_CATEGORIES.map((cat) => (
                            <div key={cat.label}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">{cat.label}</span>
                                    <span className="font-mono text-sm font-bold">
                                        {cat.count} &nbsp;
                                        <span className="text-gray-400">({cat.pct}%)</span>
                                    </span>
                                </div>
                                {/* Bar */}
                                <div className="w-full bg-gray-100 border-2 border-black h-7 relative overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-700"
                                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Pie donut — CSS only ── */}
                <div className="mt-8 neo-card p-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-44 h-44 shrink-0">
                        {/* Build a conic-gradient "pie" */}
                        <div
                            className="w-full h-full rounded-full border-4 border-black shadow-neo"
                            style={{
                                background: buildConicGradient(MOCK_CATEGORIES),
                            }}
                        />
                        {/* centre hole */}
                        <div className="absolute inset-[22%] bg-white rounded-full border-2 border-black flex items-center justify-center">
                            <span className="text-xs font-black text-center leading-tight">
                                {MOCK_TOTAL_SCANS}<br />scans
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2">
                        {MOCK_CATEGORIES.map((cat) => (
                            <div key={cat.label} className="flex items-center gap-3">
                                <span
                                    className="w-4 h-4 border-2 border-black shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="font-bold text-sm">
                                    {cat.label} <span className="text-gray-500 font-normal">– {cat.pct}%</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 font-mono mt-6">
                    * Mock data shown. Live data from API in Phase 2.
                </p>
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
        <div className={`neo-card p-5 ${accent}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="text-4xl font-black mt-1">{value}</p>
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
