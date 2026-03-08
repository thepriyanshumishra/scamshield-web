import Navbar from "@/components/Navbar";

export default function TermsAndConditions() {
    return (
        <main className="min-h-screen bg-white" style={{
            backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px"
        }}>
            <Navbar />
            <section className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-5xl md:text-5xl font-black leading-none mb-8 tracking-tighter text-black uppercase shadow-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">Terms & Conditions</h1>
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8 space-y-4 font-mono">
                    <h2 className="text-xl font-black uppercase text-neo-red">1. Acceptance of Terms</h2>
                    <p className="text-sm font-bold">
                        By accessing and using ScamShield, you accept and agree to be bound by the terms and provisions of this agreement.
                    </p>

                    <h2 className="text-xl font-black uppercase text-neo-red mt-6">2. Nature of Service</h2>
                    <p className="text-sm font-bold">
                        ScamShield is an AI-assisted analytical tool. While we strive for high accuracy, we CANNOT guarantee that every analysis to be 100% correct. A &quot;Safe&quot; result does not constitute absolute financial safety. Users must exercise their own judgment when interacting with unknown digital entities.
                    </p>

                    <h2 className="text-xl font-black uppercase text-neo-red mt-6">3. No Legal Liability</h2>
                    <p className="text-sm font-bold">
                        The developers, contributors, and hosting providers of ScamShield shall not be held liable for any financial losses, data breaches, or emotional damages resulting from the use or inability to use the service.
                    </p>

                    <h2 className="text-xl font-black uppercase text-neo-red mt-6">4. Open Source</h2>
                    <p className="text-sm font-bold">
                        The core logic is open-source. Do not misuse the public APIs aggressively to perform denial of service. Rate limiting is applied.
                    </p>
                </div>
            </section>
        </main>
    );
}
