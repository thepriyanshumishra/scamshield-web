"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

// ── Game Types ────────────────────────────────────────────────────────────
type LevelData = {
    text: string;
    isScam: boolean;
    explanation: string;
};

// ── Components ────────────────────────────────────────────────────────────
export default function ArcadePage() {
    const [currentLevelNum, setCurrentLevelNum] = useState(1);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<"LOADING" | "PLAYING" | "REVEALED" | "GAMEOVER">("LOADING");
    const [userGuessedScam, setUserGuessedScam] = useState<boolean | null>(null);
    const [level, setLevel] = useState<LevelData | null>(null);

    // Initial fetch
    useState(() => {
        fetchNextLevel();
    });

    async function fetchNextLevel() {
        setGameState("LOADING");
        try {
            const res = await fetch("http://127.0.0.1:8000/arcade/generate");
            const data = await res.json();
            setLevel(data);
            setGameState("PLAYING");
        } catch (e) {
            console.error("Failed to fetch next level", e);
            setLevel({
                text: "Connection to AI engine failed. Please try again.",
                isScam: false,
                explanation: "Please ensure the backend server is running."
            });
            setGameState("PLAYING");
        }
    }

    function handleGuess(guessIsScam: boolean) {
        if (gameState !== "PLAYING" || !level) return;

        setUserGuessedScam(guessIsScam);
        if (guessIsScam === level.isScam) {
            setScore((s) => s + 1);
            setGameState("REVEALED");
        } else {
            setGameState("GAMEOVER");
        }
    }

    function handleNext() {
        setCurrentLevelNum((c) => c + 1);
        setUserGuessedScam(null);
        fetchNextLevel();
    }

    function handleRestart() {
        setCurrentLevelNum(1);
        setScore(0);
        setUserGuessedScam(null);
        fetchNextLevel();
    }

    return (
        <main className="min-h-screen bg-neo-blue text-white flex flex-col" style={{
            backgroundImage: "radial-gradient(#000 2px, transparent 2px)",
            backgroundSize: "30px 30px"
        }}>
            <Navbar />

            <section className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-neo-yellow text-black border-2 border-black shadow-neo px-3 py-1 text-sm font-bold mb-4">
                        ScamShield Arcade
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mix-blend-difference text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        Can you outsmart the AI?
                    </h1>

                    {/* Visual Progress Pips (Endless) */}
                    {gameState !== "GAMEOVER" && (
                        <div className="flex justify-center gap-2 mt-6 flex-wrap">
                            <div className="bg-neo-green font-black text-black px-3 py-1 border-2 border-black flex items-center justify-center">
                                SCORE: {score}
                            </div>
                            <div className="bg-neo-yellow px-3 py-1 border-2 border-black font-black text-black flex items-center justify-center animate-pulse">
                                LEVEL: {currentLevelNum}
                            </div>
                        </div>
                    )}
                </div>

                {gameState === "GAMEOVER" ? (
                    <div className="neo-card bg-white text-black p-8 text-center animate-in zoom-in-95 duration-500">
                        <h2 className="text-4xl font-black mb-2 animate-bounce">💀 Game Over!</h2>
                        <p className="text-xl font-bold mb-6">
                            You survived <span className="text-neo-red">{currentLevelNum - 1}</span> rounds.
                        </p>

                        <div className="bg-neo-red text-white p-6 border-4 border-black font-bold mb-8 shadow-neo-sm relative overflow-hidden">
                            <h3 className="text-2xl font-black mb-2">
                                {level?.isScam && userGuessedScam === false
                                    ? "You got scammed!"
                                    : "You were too paranoid!"}
                            </h3>
                            <p className="text-sm font-medium">
                                {level?.isScam && userGuessedScam === false
                                    ? "Human intuition fails eventually. The Groq AI engine caught what you missed."
                                    : "This was a perfectly safe message, but you panicked. The Groq AI engine knew better."}
                            </p>
                        </div>

                        <button onClick={handleRestart} className="btn-neo-blue w-full py-4 text-xl tracking-widest font-black uppercase">
                            🔄 Retry Survival Mode
                        </button>
                    </div>
                ) : gameState === "LOADING" ? (
                    <div className="neo-card bg-white text-black p-12 text-center flex flex-col items-center justify-center border-4 border-black min-h-[400px]">
                        <div className="w-16 h-16 border-8 border-neo-blue border-t-neo-yellow rounded-full animate-spin mb-6"></div>
                        <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">
                            AI is Generating Scenario...
                        </h2>
                        <p className="font-bold text-gray-500 mt-2">Connecting to Groq Engine</p>
                    </div>
                ) : level && (
                    <div className="neo-card bg-white text-black p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300 shadow-[12px_12px_0px_rgba(0,0,0,1)]">

                        {/* The Message */}
                        <div className="bg-[#fff9e6] p-8 border-4 border-black mb-10 relative shadow-inner">
                            <span className="absolute -top-4 left-6 bg-black text-neo-yellow text-sm font-black px-4 py-1 uppercase tracking-widest">
                                Incoming Data
                            </span>
                            <p className="font-mono text-xl font-bold leading-relaxed text-gray-800">
                                &quot;{level.text}&quot;
                            </p>
                        </div>

                        {/* Question */}
                        {gameState === "PLAYING" && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                <p className="text-center font-black text-2xl mb-6 uppercase tracking-widest border-b-4 border-black inline-block px-4 pb-1 mx-auto block w-max">Is this a scam?</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={() => handleGuess(true)}
                                        className="btn-neo-red py-8 text-2xl font-black active:translate-y-2 active:shadow-none transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                                    >
                                        🚨 SCAM
                                    </button>
                                    <button
                                        onClick={() => handleGuess(false)}
                                        className="btn-neo-green py-8 text-2xl font-black active:translate-y-2 active:shadow-none transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] text-black"
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
