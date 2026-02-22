"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Game Data ─────────────────────────────────────────────────────────────
const LEVEL_DATA = [
    {
        text: "SBI ALERT: Your account has been temporarily suspended due to KYC expiry. Click here to verify your identity immediately: http://sbi-update-kyc.in/auth",
        isScam: true,
        explanation: "Urgency tactics ('immediately') combined with a non-official URL (sbi-update-kyc.in instead of sbi.co.in) is a classic phishing red flag.",
    },
    {
        text: "Your Amazon package containing 'Sony WH-1000XM4' is out for delivery today. OTP is 4920. Share with delivery agent only.",
        isScam: false,
        explanation: "This is a standard transactional SMS from a trusted service. No suspicious links, no money requested.",
    },
    {
        text: "Congratulations! Your mobile number has won £1,000,000 in the International Mobile Draw. Send your bank details to claim@mobile-draw-winner.co.uk to claim your prize.",
        isScam: true,
        explanation: "Classic advance-fee lottery scam. You cannot win a lottery you didn't enter, and legitimate lotteries don't ask for banking details upfront via email.",
    },
    {
        text: "Hi Mom, I dropped my phone in the toilet and I'm using a friend's phone. Can you urgently WhatsApp me on this new number +447911123456? I need £50 for a cab home.",
        isScam: true,
        explanation: "The 'Hi Mum/Dad' scam. Scammers impersonate distressed family members to extract direct, urgent bank transfers.",
    },
    {
        text: "Here is your 6-digit GitHub verification code: 829104. Valid for 10 minutes. Do not share this with anyone.",
        isScam: false,
        explanation: "Standard Two-Factor Authentication (2FA) OTP. No external links, explicit warning not to share.",
    },
];

// ── Components ────────────────────────────────────────────────────────────
export default function ArcadePage() {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<"PLAYING" | "REVEALED" | "GAMEOVER">("PLAYING");
    const [userGuessedScam, setUserGuessedScam] = useState<boolean | null>(null);

    const level = LEVEL_DATA[currentLevel];

    function handleGuess(guessIsScam: boolean) {
        if (gameState !== "PLAYING") return;

        setUserGuessedScam(guessIsScam);
        if (guessIsScam === level.isScam) {
            setScore((s) => s + 1);
        }
        setGameState("REVEALED");
    }

    function handleNext() {
        if (currentLevel < LEVEL_DATA.length - 1) {
            setCurrentLevel((c) => c + 1);
            setGameState("PLAYING");
            setUserGuessedScam(null);
        } else {
            setGameState("GAMEOVER");
        }
    }

    function handleRestart() {
        setCurrentLevel(0);
        setScore(0);
        setGameState("PLAYING");
        setUserGuessedScam(null);
    }

    return (
        <main className="min-h-screen bg-neo-blue text-white flex flex-col">
            <Navbar />

            <section className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-neo-yellow text-black border-2 border-black shadow-neo px-3 py-1 text-sm font-bold mb-4">
                        ScamShield Arcade
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                        Can you outsmart the AI?
                    </h1>
                    <p className="font-bold mt-2 text-white/80">
                        {gameState !== "GAMEOVER" && `Level ${currentLevel + 1} of ${LEVEL_DATA.length}`}
                    </p>
                </div>

                {gameState === "GAMEOVER" ? (
                    <div className="neo-card bg-white text-black p-8 text-center animate-in zoom-in-95 duration-500">
                        <h2 className="text-4xl font-black mb-2">Game Over!</h2>
                        <p className="text-xl font-bold mb-6">
                            You scored <span className="text-neo-red">{score}</span> out of {LEVEL_DATA.length}.
                        </p>

                        {score === LEVEL_DATA.length ? (
                            <p className="bg-neo-green p-4 border-2 border-black font-bold mb-8 shadow-neo-sm">
                                🎉 Perfect Score! You have the instincts of an AI fraud detector.
                            </p>
                        ) : score >= 3 ? (
                            <p className="bg-neo-yellow p-4 border-2 border-black font-bold mb-8 shadow-neo-sm">
                                👍 Not bad! You spotted most of them, but scammers are tricky.
                            </p>
                        ) : (
                            <p className="bg-neo-red text-white p-4 border-2 border-black font-bold mb-8 shadow-neo-sm">
                                🚨 Warning! You might be susceptible to modern scams. Let ScamShield help you!
                            </p>
                        )}

                        <button onClick={handleRestart} className="btn-neo-blue w-full py-4 text-lg">
                            🔄 Play Again
                        </button>
                    </div>
                ) : (
                    <div className="neo-card bg-white text-black p-6 md:p-8 animate-in fade-in duration-300">

                        {/* The Message */}
                        <div className="bg-gray-100 p-6 border-2 border-black mb-8 relative">
                            <span className="absolute -top-3 left-4 bg-black text-white text-xs font-bold px-2 py-1">
                                INCOMING MESSAGE
                            </span>
                            <p className="font-mono text-lg font-medium leading-relaxed">
                                &quot;{level.text}&quot;
                            </p>
                        </div>

                        {/* Question */}
                        {gameState === "PLAYING" && (
                            <div className="space-y-4">
                                <p className="text-center font-black text-xl mb-4">Is this a scam?</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleGuess(true)}
                                        className="btn-neo-red py-6 text-xl active:translate-y-1 active:shadow-none transition-all hover:-translate-y-1 hover:shadow-neo"
                                    >
                                        🚨 SCAM
                                    </button>
                                    <button
                                        onClick={() => handleGuess(false)}
                                        className="btn-neo-green py-6 text-xl active:translate-y-1 active:shadow-none transition-all hover:-translate-y-1 hover:shadow-neo"
                                    >
                                        ✅ SAFE
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Reveal */}
                        {gameState === "REVEALED" && (
                            <div className="animate-in slide-in-from-bottom-4 duration-300">
                                <div className={`p-4 border-2 border-black mb-6 ${userGuessedScam === level.isScam ? "bg-neo-green text-back" : "bg-neo-red text-white"}`}>
                                    <h3 className="text-2xl font-black mb-1">
                                        {userGuessedScam === level.isScam ? "🎯 Correct!" : "❌ Incorrect!"}
                                    </h3>
                                    <p className="font-bold">
                                        This message is strictly <u>{level.isScam ? "A SCAM" : "SAFE"}</u>.
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">AI Explanation</span>
                                    <p className="font-semibold text-lg mt-1">{level.explanation}</p>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="btn-neo w-full py-4 text-lg active:translate-y-1 active:shadow-none transition-all"
                                >
                                    Next Level ➜
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
