import Navbar from "@/components/Navbar";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Privacy Policy — ScamShield",
    description: "ScamShield Privacy Policy. We do not store PII. Our blockchain ledger only stores cryptographic hashes.",
    openGraph: {
        title: "Privacy Policy | ScamShield",
        description: "Read how ScamShield protects your data and privacy.",
    }
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white" style={{
            backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px"
        }}>
            <Navbar />
            <section className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-5xl md:text-6xl font-black leading-none mb-8 tracking-tighter text-black uppercase shadow-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">Privacy Policy</h1>
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8 space-y-4 font-mono">
                    <h2 className="text-xl font-black uppercase text-neo-red">1. Data Collection</h2>
                    <p className="text-sm font-bold">
                        ScamShield is designed to prioritize your privacy. We do not require account creation, and we do not store personal identifiable information (PII) unless explicitly provided for feedback purposes. The text and images you submit for analysis are processed transiently and are not tied to your identity.
                    </p>

                    <h2 className="text-xl font-black uppercase text-neo-red mt-6">2. Blockchain Ledger</h2>
                    <p className="text-sm font-bold">
                        When you choose to &quot;Add to Ledger&quot;, ONLY a cryptographic hash (SHA-256) of the scam message is stored on our public blockchain. This ensures that the scam&apos;s fingerprint is immortalized without exposing the original, potentially sensitive context of the message.
                    </p>

                    <h2 className="text-xl font-black uppercase text-neo-red mt-6">3. Third-party Services</h2>
                    <p className="text-sm font-bold">
                        We utilize third-party AI models (e.g., Gemini) for text and image analysis. The data sent to these APIs is subject to their respective privacy policies. We strip metadata from images before transmission where possible.
                    </p>
                </div>
            </section>
        </main>
    );
}
