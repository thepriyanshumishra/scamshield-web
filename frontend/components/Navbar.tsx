"use client";

import Link from "next/link";

// ── Navbar ────────────────────────────────────────────────────────────────
/**
 * Neobrutalism top navigation bar.
 * Bold black border at the bottom, bright yellow logo accent.
 */
export default function Navbar() {
    return (
        <nav className="w-full border-b-4 border-black bg-white px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group text-black transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px]">
                {/* Shield Icon matching uploaded image closely */}
                <svg viewBox="0 0 100 100" className="w-10 h-10 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer thick border */}
                    <path d="M50 5 L10 20 V45 C10 70 25 85 50 95 C75 85 90 70 90 45 V20 L50 5 Z" stroke="black" strokeWidth="6" strokeLinejoin="miter" />
                    {/* Maze/circuit accents */}
                    <path d="M50 5 V20 M10 40 H25 V30 M90 40 H75 V30 M20 65 H30 M80 65 H70 M50 95 V80" stroke="black" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
                    {/* Inner shield */}
                    <path d="M50 20 L25 30 V50 C25 65 35 75 50 80 C65 75 75 65 75 50 V30 L50 20 Z" stroke="black" strokeWidth="4" strokeLinejoin="miter" />
                    {/* Checkmark inside inner shield */}
                    <path d="M40 55 L47 62 L62 42" stroke="black" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>

                {/* Text: 'Scam' in bright lime-yellow green, 'Shield' in normal font */}
                <span className="text-2xl font-black tracking-tighter flex items-center leading-none mt-1">
                    {/* Using exact color matching the image background for 'Scam' */}
                    <span className="bg-[#CEE02E] px-1 py-0.5">Scam</span>
                    <span className="pr-1 py-0.5 text-black">Shield</span>
                </span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
                <NavLink href="/">Detect</NavLink>
                <NavLink href="/ledger">Ledger</NavLink>
                <NavLink href="/trends">Trends</NavLink>
                <NavLink href="/arcade">Arcade 🎮</NavLink>
                <NavLink href="/developers">API 💻</NavLink>
            </div>
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="
        px-4 py-2 font-bold text-sm text-black
        border-2 border-transparent
        hover:border-black hover:bg-neo-yellow hover:shadow-neo-sm
        hover:translate-x-[1px] hover:translate-y-[1px]
        transition-all duration-100
      "
        >
            {children}
        </Link>
    );
}
