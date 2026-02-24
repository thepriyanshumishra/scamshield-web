export default function Footer() {
    return (
        <footer className="mt-24 border-t-4 border-black bg-white">
            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Branding */}
                <div className="flex flex-col items-center md:items-start space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rotate-3 flex items-center justify-center">
                            <span className="text-white font-bold">🛡️</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">ScamShield</h2>
                    </div>
                    <p className="text-gray-600 font-mono text-sm font-medium">
                        Open-source threat intelligence.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
                    <a
                        href="https://cybercrime.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border-2 border-black hover:bg-neo-red hover:text-white transition-colors flex items-center gap-2"
                    >
                        🚨 Report Cybercrime
                    </a>
                    <a
                        href="https://cert-in.org.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                        CERT-In
                    </a>
                    <a
                        href="https://sancharsaathi.gov.in/sfc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                        Sanchar Saathi
                    </a>
                </div>
            </div>

            <div className="border-t-4 border-black bg-[#FFDE59] py-4 text-center font-black text-sm uppercase tracking-widest">
                Protecting the digital frontier 🌐
            </div>
        </footer>
    );
}
