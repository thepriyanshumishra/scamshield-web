import Navbar from "@/components/Navbar";

export default function About() {
    return (
        <main className="min-h-screen bg-white" style={{
            backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px"
        }}>
            <Navbar />
            <section className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-5xl md:text-6xl font-black leading-none mb-8 tracking-tighter text-black uppercase shadow-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">What is ScamShield?</h1>
                <div className="bg-neo-yellow border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8">
                    <p className="text-lg font-bold mb-4">
                        ScamShield is an open-source, AI-powered threat intelligence platform designed to protect users from modern digital scams, phishing attempts, and fraudulent messages.
                    </p>
                    <p className="text-lg font-bold">
                        By combining advanced machine learning with immutable blockchain storage, we aim to provide instant, decentralized, and highly accurate scam detection for everyone, completely free of charge.
                    </p>
                </div>
            </section>
        </main>
    );
}
