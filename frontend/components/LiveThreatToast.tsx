"use client";

import { useEffect, useState } from "react";

// ── Mock live threats ───────────────────────────────────────────────────────
const THREAT_MESSAGES = [
    { title: "🚨 Phishing Blocked", msg: "A fake SBI alert was intercepted in Mumbai.", color: "bg-neo-red" },
    { title: "🚨 Job Scam Prevented", msg: "Suspicious WhatsApp WFH offer flagged.", color: "bg-neo-orange" },
    { title: "✅ Safe Message", msg: "Legitimate delivery OTP verified.", color: "bg-neo-green" },
    { title: "🚨 Bank Scam Stopped", msg: "KYC update fraud link blocked on network.", color: "bg-neo-red" },
    { title: "✅ Safe Message", msg: "Standard Amazon delivery alert processed.", color: "bg-neo-green" },
    { title: "🚨 Crypto Scam", msg: "Wallet drainer link blocked on Amoy.", color: "bg-neo-pink" },
];

export default function LiveThreatToast() {
    const [toast, setToast] = useState<{ title: string; msg: string; color: string } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Run a simulation loop
        const scheduleNextToast = () => {
            // Random delay between 8 and 18 seconds
            const delay = Math.floor(Math.random() * 10000) + 8000;

            setTimeout(() => {
                // Pick a random message
                const randomMsg = THREAT_MESSAGES[Math.floor(Math.random() * THREAT_MESSAGES.length)];
                setToast(randomMsg);
                setIsVisible(true);

                // Hide it after 4 seconds
                setTimeout(() => {
                    setIsVisible(false);
                }, 4000);

                // Recursively schedule next
                scheduleNextToast();
            }, delay);
        };

        // Start initial timeout
        scheduleNextToast();
    }, []);

    // We keep it mounted but animate it in/out using arbitrary Tailwind transforms
    return (
        <div
            className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                }`}
        >
            {toast && (
                <div className={`neo-card p-4 flex gap-4 items-start max-w-sm ${toast.color === "bg-neo-green" ? "bg-neo-green" : "bg-white"}`}>
                    <div className={`shrink-0 w-2 h-full absolute left-0 top-0 border-r-2 border-black ${toast.color}`} />
                    <div className="pl-2">
                        <p className="font-black text-sm uppercase tracking-tight">{toast.title}</p>
                        <p className="font-medium text-xs text-gray-800 mt-1">{toast.msg}</p>
                        <p className="font-mono text-[10px] text-gray-500 mt-2 font-bold tracking-tighter">LIVE NETWORK STREAM</p>
                    </div>
                </div>
            )}
        </div>
    );
}
