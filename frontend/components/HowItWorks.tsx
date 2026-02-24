export default function HowItWorks() {
    return (
        <div className="max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                    How It <span className="text-neo-blue">Works</span>
                </h2>
                <p className="text-xl font-mono text-gray-600 border-b-4 border-black inline-block pb-2">
                    Three steps to complete digital security
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                {/* Step 1 */}
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all group">
                    <div className="w-16 h-16 bg-[#FFDE59] border-4 border-black font-black text-3xl flex items-center justify-center mb-6 shadow-neo-sm group-hover:rotate-12 transition-transform">
                        1
                    </div>
                    <h3 className="text-2xl font-black mb-3">Input Data</h3>
                    <p className="font-mono text-sm leading-relaxed">
                        Paste suspicious text messages, WhatsApp forwards, emails, URLs, or scan a QR code into the secure sandbox.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all group">
                    <div className="w-16 h-16 bg-neo-pink border-4 border-black font-black text-3xl flex items-center justify-center mb-6 shadow-neo-sm group-hover:-rotate-12 transition-transform text-white">
                        2
                    </div>
                    <h3 className="text-2xl font-black mb-3">AI Analysis</h3>
                    <p className="font-mono text-sm leading-relaxed">
                        Our specialized Llama-3 model instantly rips apart the content, detecting psychological triggers and known fraud patterns.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all group">
                    <div className="w-16 h-16 bg-neo-green border-4 border-black font-black text-3xl flex items-center justify-center mb-6 shadow-neo-sm group-hover:rotate-12 transition-transform text-white">
                        3
                    </div>
                    <h3 className="text-2xl font-black mb-3">On-Chain Record</h3>
                    <p className="font-mono text-sm leading-relaxed">
                        Confirmed scams are hashed and permanently vaulted into the Ethereum blockchain, creating a tamper-proof global ledger.
                    </p>
                </div>
            </div>

            <div className="mt-20 flex justify-center">
                <div className="bg-black text-white px-8 py-6 font-mono text-sm border-4 border-[#FFDE59] shadow-[8px_8px_0px_#FFDE59] text-center max-w-2xl transform -rotate-1">
                    &quot;ScamShield builds collective immunity against digital deception by sharing threat intelligence globally.&quot;
                </div>
            </div>
        </div>
    );
}
