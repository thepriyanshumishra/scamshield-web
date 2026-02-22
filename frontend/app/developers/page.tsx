"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Developer API Portal ──────────────────────────────────────────────────
export default function DevelopersPage() {
    const [activeTab, setActiveTab] = useState<"curl" | "python" | "node">("curl");

    const codeSnippets = {
        curl: `curl -X POST "https://api.scamshield.app/v1/analyze-text" \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Click here to claim your free iPhone: http://free-phishing.com"
  }'`,

        python: `import requests

url = "https://api.scamshield.app/v1/analyze-text"
headers = {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "message": "Click here to claim your free iPhone: http://free-phishing.com"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,

        node: `const axios = require('axios');

const analyzeMessage = async () => {
  const response = await axios.post('https://api.scamshield.app/v1/analyze-text', {
    message: "Click here to claim your free iPhone: http://free-phishing.com"
  }, {
    headers: {
      'Authorization': 'Bearer sk_live_YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data);
};

analyzeMessage();`
    };

    const jsonResponse = `{
  "probability": 0.98,
  "category": "phishing",
  "red_flags": [
    "Urgency to click a link",
    "Suspicious non-official domain",
    "Too good to be true offer"
  ],
  "advice": "Do not click. Legitimate companies do not give away free iPhones via random SMS links.",
  "ledger_hash": "0x4f...a1b"
}`;

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <div className="inline-block bg-neo-green text-black border-2 border-black shadow-[4px_4px_0px_rgba(255,255,255,1)] px-3 py-1 text-sm font-bold mb-6">
                    v1 API Documentation
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-white">
                    Secure your platform.<br />
                    Protect your users.
                </h1>
                <p className="text-xl text-gray-400 font-medium max-w-2xl mb-10">
                    Integrate ScamShield&apos;s Groq-powered AI engine directly into your chat, social, or banking app with a single API call.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => alert("API Key generation will be available after the hackathon!")}
                        className="bg-neo-yellow text-black font-black text-lg px-8 py-4 border-2 border-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(255,255,255,1)] active:translate-y-1 active:shadow-none transition-all"
                    >
                        🔑 Generate Test Key
                    </button>
                    <button className="bg-transparent text-white font-bold text-lg px-8 py-4 border-2 border-white hover:bg-white hover:text-black transition-colors">
                        Read Docs ↗
                    </button>
                </div>
            </section>

            {/* Interactive Code Section */}
            <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: Request Segment */}
                <div className="border-2 border-white p-1 pb-6 bg-[#111]">
                    <div className="flex border-b-2 border-white bg-black">
                        <button
                            onClick={() => setActiveTab("curl")}
                            className={`flex-1 py-3 px-4 font-mono text-sm font-bold border-r-2 border-white transition-colors ${activeTab === "curl" ? "bg-neo-blue text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            cURL
                        </button>
                        <button
                            onClick={() => setActiveTab("python")}
                            className={`flex-1 py-3 px-4 font-mono text-sm font-bold border-r-2 border-white transition-colors ${activeTab === "python" ? "bg-neo-blue text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            Python
                        </button>
                        <button
                            onClick={() => setActiveTab("node")}
                            className={`flex-1 py-3 px-4 font-mono text-sm font-bold transition-colors ${activeTab === "node" ? "bg-neo-blue text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            Node.js
                        </button>
                    </div>
                    <div className="p-6 relative">
                        <pre className="font-mono text-sm text-neo-green overflow-x-auto">
                            {codeSnippets[activeTab]}
                        </pre>
                        <button
                            onClick={() => navigator.clipboard.writeText(codeSnippets[activeTab])}
                            className="absolute top-4 right-4 bg-white text-black font-bold text-xs px-2 py-1 border-2 border-black hover:bg-neo-yellow transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Right: Response Segment */}
                <div className="border-2 border-white p-1 bg-[#111]">
                    <div className="flex border-b-2 border-white bg-black items-center px-4 py-3">
                        <span className="w-3 h-3 rounded-full bg-neo-red mr-2"></span>
                        <span className="w-3 h-3 rounded-full bg-neo-yellow mr-2"></span>
                        <span className="w-3 h-3 rounded-full bg-neo-green mr-4"></span>
                        <span className="font-mono text-sm font-bold text-gray-400">Response (JSON)</span>
                    </div>
                    <div className="p-6">
                        <pre className="font-mono text-sm text-neo-yellow overflow-x-auto">
                            {jsonResponse}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Enterprise Pitch */}
            <section className="border-t-2 border-white/20 bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto px-6 py-24 text-center">
                    <h2 className="text-4xl font-black mb-6">Built for scale. Backed by Polygon.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="p-6 border-2 border-white/20 bg-black">
                            <h3 className="text-2xl font-black text-neo-green mb-3">&lt; 100ms</h3>
                            <p className="text-gray-400 font-medium font-mono text-sm">Groq-powered inference speed.</p>
                        </div>
                        <div className="p-6 border-2 border-white/20 bg-black">
                            <h3 className="text-2xl font-black text-neo-blue mb-3">Immutable</h3>
                            <p className="text-gray-400 font-medium font-mono text-sm">Fingerprints anchored on Amoy testnet.</p>
                        </div>
                        <div className="p-6 border-2 border-white/20 bg-black">
                            <h3 className="text-2xl font-black text-neo-yellow mb-3">99.9%</h3>
                            <p className="text-gray-400 font-medium font-mono text-sm">Targeted zero-day threat detection.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
