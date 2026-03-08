import type { Metadata } from 'next';
import ArcadePage from './page';

export const metadata: Metadata = {
    title: "Arcade — ScamShield",
    description: "Test your intuition against the Groq AI engine. Can you spot the scams?",
    openGraph: {
        title: "ScamShield Arcade",
        description: "Can you outsmart the AI? Play the ScamShield survival mode.",
    }
};

export default function Layout() {
    return <ArcadePage />;
}
