import type { Metadata } from 'next';
import DevelopersPage from './page';

export const metadata: Metadata = {
    title: "API Portal — ScamShield",
    description: "Integrate ScamShield's AI engine directly into your chat, social, or banking app with a single API call.",
    openGraph: {
        title: "Developers | ScamShield",
        description: "Built for scale. Backed by Polygon. Protect your users with our API.",
    }
};

export default function Layout() {
    return <DevelopersPage />;
}
