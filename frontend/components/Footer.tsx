import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-24 border-t-4 border-black bg-white">
            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Branding */}
                <div className="flex flex-col items-center md:items-start space-y-2">
                    <div className="flex items-center gap-3">
                        <svg viewBox="0 0 100 100" className="w-10 h-10 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 5 L10 20 V45 C10 70 25 85 50 95 C75 85 90 70 90 45 V20 L50 5 Z" stroke="black" strokeWidth="6" strokeLinejoin="miter" />
                            <path d="M50 5 V20 M10 40 H25 V30 M90 40 H75 V30 M20 65 H30 M80 65 H70 M50 95 V80" stroke="black" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
                            <path d="M50 20 L25 30 V50 C25 65 35 75 50 80 C65 75 75 65 75 50 V30 L50 20 Z" stroke="black" strokeWidth="4" strokeLinejoin="miter" />
                            <path d="M40 55 L47 62 L62 42" stroke="black" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                        </svg>
                        <span className="text-2xl font-black tracking-tighter flex items-center leading-none mt-1">
                            <span className="bg-[#CEE02E] px-1 py-0.5 text-black">Scam</span>
                            <span className="pr-1 py-0.5 text-black">Shield</span>
                        </span>
                    </div>
                    <p className="text-gray-600 font-mono text-sm font-medium">
                        Open-source threat intelligence.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap flex-col md:flex-row justify-center md:items-start items-center gap-8 text-sm font-bold w-full md:w-auto mt-8 md:mt-0">
                    <div className="flex flex-col gap-3">
                        <Link href="/about" className="hover:underline underline-offset-4 decoration-2">What is ScamShield?</Link>
                        <Link href="/vision" className="hover:underline underline-offset-4 decoration-2">Our Vision</Link>
                        <Link href="/privacy" className="hover:underline underline-offset-4 decoration-2">Privacy Policy</Link>
                        <Link href="/terms" className="hover:underline underline-offset-4 decoration-2">Terms & Conditions</Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        <a
                            href="https://cybercrime.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:underline underline-offset-4 decoration-2 text-neo-red px-2 py-1 border-2 border-black bg-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                            🚨 Report Cybercrime
                        </a>
                        <a
                            href="https://cert-in.org.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4 decoration-2"
                        >
                            CERT-In
                        </a>
                        <a
                            href="https://sancharsaathi.gov.in/sfc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4 decoration-2"
                        >
                            Sanchar Saathi
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t-4 border-black bg-[#FFDE59] py-4 text-center font-black text-sm uppercase tracking-widest">
                Protecting the digital frontier 🌐
            </div>
        </footer>
    );
}
