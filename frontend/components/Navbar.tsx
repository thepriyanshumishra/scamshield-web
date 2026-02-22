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
            <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tighter">
                    🛡️{" "}
                    <span className="bg-neo-yellow px-1 border-2 border-black shadow-neo-sm group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-100">
                        Scam
                    </span>
                    Shield
                </span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
                <NavLink href="/">Detect</NavLink>
                <NavLink href="/ledger">Ledger</NavLink>
                <NavLink href="/trends">Trends</NavLink>
            </div>
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="
        px-4 py-2 font-bold text-sm
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
