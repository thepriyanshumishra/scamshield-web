import type { Metadata } from 'next';
import TrendsPage from './page';

export const metadata: Metadata = {
    title: "Trends — ScamShield",
    description: "Real-time visual analysis of scam patterns archived on the Polygon Amoy Testnet.",
    openGraph: {
        title: "Global Threat Radar | ScamShield",
        description: "Live visualizations of malicious networks and tracked threats.",
    }
};

export default function Layout() {
    return <TrendsPage />;
}
