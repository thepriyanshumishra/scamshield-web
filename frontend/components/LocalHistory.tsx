"use client";

import { useEffect, useState } from "react";

interface HistoryItem {
    timestamp: string;
    message: string;
    category: string;
    probability: number;
}

export default function LocalHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const loadHistory = () => {
        try {
            const stored = localStorage.getItem("scamshield_history");
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadHistory();
        // Listen for custom event triggered from page.tsx when analyze runs
        window.addEventListener("historyUpdated", loadHistory);
        return () => window.removeEventListener("historyUpdated", loadHistory);
    }, []);

    if (history.length === 0) return null;

    return (
        <div className="mt-12 bg-gray-50 border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>🕒</span> Recent Scans (Local)
            </h3>
            <div className="flex justify-between items-center bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>Message Snippet</span>
                <span>Risk Profile</span>
            </div>
            <div className="space-y-2">
                {history.map((item, idx) => {
                    const isScam = item.probability >= 0.5;
                    return (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white border-2 border-black p-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="font-mono text-xs truncate max-w-sm sm:max-w-md" title={item.message}>
                                    {item.message}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">
                                    {new Date(item.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <div className="mt-2 sm:mt-0 flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isScam ? 'bg-neo-red text-white' : 'bg-neo-green text-white'}`}>
                                    {item.category}
                                </span>
                                <span className="text-[10px] font-bold mt-1">
                                    {Math.round(item.probability * 100)}% Threat
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
