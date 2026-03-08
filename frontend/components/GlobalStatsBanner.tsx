"use client";

import { useEffect, useState } from "react";

export default function GlobalStatsBanner() {
    const [scamCount, setScamCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("http://127.0.0.1:8000/scams");
                if (res.ok) {
                    const data = await res.json();
                    setScamCount(data.total);
                }
            } catch (err) {
                console.error("Failed to fetch scam stats", err);
            }
        }
        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (scamCount === null) return null;

    return (
        <div className="bg-neo-blue text-white py-2 px-4 border-b-4 border-black flex justify-center items-center gap-3">
            <span className="animate-pulse">🔴</span>
            <p className="font-mono font-bold text-sm md:text-base">
                ScamShield Network:
                <span className="ml-2 bg-black text-white px-2 py-0.5 rounded shadow-[2px_2px_0px_rgba(255,255,255,1)]">
                    {scamCount.toLocaleString()}
                </span>{" "}
                malicious threats blocked globally.
            </p>
        </div>
    );
}
