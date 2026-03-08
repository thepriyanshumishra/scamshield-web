import Navbar from "@/components/Navbar";

export default function Vision() {
    return (
        <main className="min-h-screen bg-white" style={{
            backgroundImage: "radial-gradient(#e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px"
        }}>
            <Navbar />
            <section className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-5xl md:text-6xl font-black leading-none mb-8 tracking-tighter text-black uppercase shadow-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">Our Vision</h1>
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8 space-y-4 font-mono">
                    <h2 className="text-2xl font-black uppercase text-neo-red">A Scam-Free Digital Future</h2>
                    <p className="text-base font-bold">
                        Fraudsters are evolving rapidly, utilizing AI and social engineering to deceive even the most vigilant users. Traditional blacklists and manual reporting are no longer sufficient to secure the digital frontier.
                    </p>
                    <p className="text-base font-bold">
                        Our vision is to build an ecosystem where cyber threats are neutralized instantly. We envision a safer internet where individuals, especially the vulnerable, are armed with enterprise-grade threat detection right in their pockets.
                    </p>
                    <p className="text-base font-bold bg-black text-white p-3 border-2 border-black inline-block mt-4">
                        &quot;Security is not a privilege; it is a fundamental right.&quot;
                    </p>
                </div>
            </section>
        </main>
    );
}
