import type { Metadata } from 'next';
import LedgerPage from './page';

export const metadata: Metadata = {
    title: "Ledger — ScamShield",
    description: "View immutable threat fingerprints safely stored on the ScamShield Polygon Network.",
    openGraph: {
        title: "Blockchain Ledger | ScamShield",
        description: "Live feed of scams detected and anchored to the Polygon blockchain.",
    }
};

export default function Layout() {
    return <LedgerPage />;
}
