"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Maximize2,
    Minimize2,
    X,
    Play,
    Pause,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Brain,
    BookOpen,
    Target,
    PenTool,
    Star,
    ChevronRight,
} from "lucide-react";

// Segment definitions
const PHASES = [
    {
        id: "review",
        name: "Review Phase",
        durationMinutes: 10,
        color: "from-indigo-500/20 via-purple-500/10 to-transparent",
        accentBg: "bg-indigo-500",
        accentText: "text-indigo-300",
        badgeBg: "bg-indigo-500/20 border-indigo-500/30 text-indigo-200",
        glowColor: "rgba(99,102,241,0.25)",
        icon: Brain,
        description: "Active recall session to solidify long-term memory",
    },
    {
        id: "new",
        name: "New Material",
        durationMinutes: 10,
        color: "from-cyan-500/20 via-blue-500/10 to-transparent",
        accentBg: "bg-cyan-500",
        accentText: "text-cyan-300",
        badgeBg: "bg-cyan-500/20 border-cyan-500/30 text-cyan-200",
        glowColor: "rgba(6,182,212,0.25)",
        icon: BookOpen,
        description: "Absorb new concepts and capture fresh notes",
    },
    {
        id: "practice",
        name: "Practice Phase",
        durationMinutes: 5,
        color: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
        accentBg: "bg-purple-500",
        accentText: "text-purple-300",
        badgeBg: "bg-purple-500/20 border-purple-500/30 text-purple-200",
        glowColor: "rgba(168,85,247,0.25)",
        icon: Target,
        description: "Apply your knowledge with active exercises",
    },
    {
        id: "reflect",
        name: "Reflect Phase",
        durationMinutes: 5,
        color: "from-emerald-500/20 via-teal-500/10 to-transparent",
        accentBg: "bg-emerald-500",
        accentText: "text-emerald-300",
        badgeBg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-200",
        glowColor: "rgba(16,185,129,0.25)",
        icon: PenTool,
        description: "Consolidate learning and capture insights",
    },
];

// Sample flashcards for the active recall session
const INITIAL_CARDS = [
    {
        id: "card-1",
        prompt: "How do you say 'Hello' in Mandarin Chinese?",
        answer: "你好 (Nǐ hǎo)",
        category: "Vocabulary",
        difficulty: "Easy",
    },
    {
        id: "card-2",
        prompt: "How do you say 'Thank you' in Mandarin?",
        answer: "谢谢 (Xièxie)",
        category: "Everyday Phrases",
        difficulty: "Medium",
    },
    {
        id: "card-3",
        prompt: "What is the key principle behind Active Recall?",
        answer: "Retrieving information from memory rather than passively re-reading it strengthens neural pathways and memory retention.",
        category: "Learning Science",
        difficulty: "Hard",
    },
    {
        id: "card-4",
        prompt: "How do you ask 'Where is the bathroom?' in Mandarin?",
        answer: "洗手间在哪里？ (Xǐshǒujiān zài nǎlǐ?)",
        category: "Everyday Phrases",
        difficulty: "Medium",
    },
];

export default function FocusSessionPage() {
    const router = useRouter();

    // State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(PHASES[0].durationMinutes * 60);
    const [isActive, setIsActive] = useState(true);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);

    // Flashcards state
    const [cardIndex, setCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardsReviewed, setCardsReviewed] = useState(0);
    const [, setScoreCounts] = useState({ forgot: 0, hard: 0, good: 0, easy: 0 });

    // Notes & Reflection State
    const [notes, setNotes] = useState("");
    const [reflectionText, setReflectionText] = useState("");
    const [focusRating, setFocusRating] = useState(5);

    const currentPhase = PHASES[currentPhaseIndex];

    // Toggle Fullscreen Function
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
            }
        }
    }, []);

    // Listen to fullscreen changes
    useEffect(() => {
        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFSChange);
        return () => document.removeEventListener("fullscreenchange", handleFSChange);
    }, []);

    // Timer Countdown Effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0 && !sessionCompleted) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !sessionCompleted) {
            // Advance to next phase or complete
            if (currentPhaseIndex < PHASES.length - 1) {
                const nextIndex = currentPhaseIndex + 1;
                setCurrentPhaseIndex(nextIndex);
                setTimeLeft(PHASES[nextIndex].durationMinutes * 60);
            } else {
                setSessionCompleted(true);
                setIsActive(false);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, currentPhaseIndex, sessionCompleted]);

    // Keyboard Shortcuts for Flashcards
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (sessionCompleted) return;

            // Esc to toggle exit menu
            if (e.key === "Escape") {
                setShowExitConfirm((prev) => !prev);
            }

            // Short-circuit if focused on inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (currentPhase.id === "review") {
                if (e.code === "Space") {
                    e.preventDefault();
                    setIsFlipped((prev) => !prev);
                } else if (isFlipped) {
                    if (e.key === "1") handleRateCard("forgot");
                    if (e.key === "2") handleRateCard("hard");
                    if (e.key === "3") handleRateCard("good");
                    if (e.key === "4") handleRateCard("easy");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPhase.id, isFlipped, sessionCompleted]);

    // Handle Card Rating
    const handleRateCard = (type: "forgot" | "hard" | "good" | "easy") => {
        setScoreCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
        setCardsReviewed((prev) => prev + 1);
        setIsFlipped(false);
        if (cardIndex < INITIAL_CARDS.length - 1) {
            setCardIndex((prev) => prev + 1);
        } else {
            setCardIndex(0); // loop back
        }
    };

    // Next Phase Handler
    const handleNextPhase = () => {
        if (currentPhaseIndex < PHASES.length - 1) {
            const nextIndex = currentPhaseIndex + 1;
            setCurrentPhaseIndex(nextIndex);
            setTimeLeft(PHASES[nextIndex].durationMinutes * 60);
        } else {
            setSessionCompleted(true);
            setIsActive(false);
        }
    };

    // Format MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const totalSessionDuration = PHASES.reduce((acc, p) => acc + p.durationMinutes, 0);

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#030611] text-white select-none transition-colors duration-1000">
            {/* Dynamic Ambient Background Glows */}
            <motion.div
                key={currentPhase.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="pointer-events-none absolute inset-0 z-0"
            >
                <div
                    className={`absolute inset-0 bg-gradient-to-b ${currentPhase.color}`}
                />
                <div
                    className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] transition-all duration-1000"
                    style={{ backgroundColor: currentPhase.glowColor }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030611_90%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
            </motion.div>

            {/* TOP MINIMAL HEADER */}
            <header className="relative z-20 flex h-20 items-center justify-between px-6 sm:px-10">
                {/* Left: Exit button */}
                <button
                    onClick={() => setShowExitConfirm(true)}
                    className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                    <X className="h-4 w-4 transition group-hover:scale-110" />
                    <span className="hidden sm:inline">Exit Session</span>
                </button>

                {/* Center: Phase Indicator & Timer */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-xl ${currentPhase.badgeBg}`}>
                        <currentPhase.icon className="h-3.5 w-3.5" />
                        <span>{currentPhase.name}</span>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
                        <span className="text-2xl font-black font-mono tracking-wider text-white">
                            {formatTime(timeLeft)}
                        </span>

                        <button
                            onClick={() => setIsActive((prev) => !prev)}
                            className="text-white/60 hover:text-white transition"
                            title={isActive ? "Pause" : "Resume"}
                        >
                            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-400" />}
                        </button>
                    </div>
                </div>

                {/* Right: Fullscreen Toggle & Skip Phase */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleNextPhase}
                        className="hidden md:flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
                    >
                        <span>Next Phase</span>
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </header>

            {/* PHASE PROGRESS BAR */}
            <div className="relative z-20 mx-auto max-w-2xl px-6">
                <div className="flex h-1.5 gap-2 overflow-hidden rounded-full bg-white/5 p-0.5 backdrop-blur-sm">
                    {PHASES.map((p, idx) => (
                        <div
                            key={p.id}
                            className={`h-full flex-1 rounded-full transition-all duration-700 ${idx === currentPhaseIndex
                                ? `${p.accentBg} shadow-[0_0_12px_rgba(99,102,241,0.5)]`
                                : idx < currentPhaseIndex
                                    ? "bg-white/30"
                                    : "bg-white/5"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* MAIN CENTERED CONTENT AREA */}
            <div className="relative z-10 flex min-h-[calc(100vh-140px)] items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {!sessionCompleted ? (
                        <motion.div
                            key={currentPhase.id}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-3xl"
                        >
                            {/* PHASE 1: ACTIVE RECALL / FLASHCARDS */}
                            {currentPhase.id === "review" && (
                                <div className="space-y-8 text-center">
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">
                                            Card {cardIndex + 1} of {INITIAL_CARDS.length} • {INITIAL_CARDS[cardIndex].category}
                                        </p>
                                        <p className="text-sm text-white/50">Press <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white">Space</kbd> or click the card to flip</p>
                                    </div>

                                    {/* 3D FLASHCARD */}
                                    <div
                                        onClick={() => setIsFlipped((prev) => !prev)}
                                        className="group relative h-80 w-full cursor-pointer [perspective:1000px]"
                                    >
                                        <motion.div
                                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                            className="relative h-full w-full rounded-[36px] border border-white/15 bg-white/5 p-8 sm:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] [transform-style:preserve-3d] flex items-center justify-center"
                                        >
                                            {/* FRONT OF CARD */}
                                            <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-12 [backface-visibility:hidden]">
                                                <div className="flex items-center justify-between text-xs text-white/40">
                                                    <span>Prompt</span>
                                                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-indigo-300">
                                                        {INITIAL_CARDS[cardIndex].difficulty}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl sm:text-3xl font-black leading-relaxed tracking-wide text-white">
                                                    {INITIAL_CARDS[cardIndex].prompt}
                                                </h3>

                                                <div className="text-xs text-white/40">
                                                    Click to reveal answer ➔
                                                </div>
                                            </div>

                                            {/* BACK OF CARD */}
                                            <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-12 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-950/40 to-slate-900/60 rounded-[36px]">
                                                <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider text-left">
                                                    Answer
                                                </div>

                                                <h3 className="text-2xl sm:text-3xl font-black leading-relaxed tracking-wide text-indigo-100">
                                                    {INITIAL_CARDS[cardIndex].answer}
                                                </h3>

                                                <div className="text-xs text-white/40">
                                                    Select your memory strength below
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* RATING BUTTONS (Shown when flipped) */}
                                    <div className="h-16">
                                        {isFlipped ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto"
                                            >
                                                <button
                                                    onClick={() => handleRateCard("forgot")}
                                                    className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-red-300 transition hover:bg-red-500/20 hover:scale-105"
                                                >
                                                    <span className="font-bold text-sm">Forgot</span>
                                                    <span className="text-[10px] text-white/40">[1]</span>
                                                </button>

                                                <button
                                                    onClick={() => handleRateCard("hard")}
                                                    className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 py-3 text-amber-300 transition hover:bg-amber-500/20 hover:scale-105"
                                                >
                                                    <span className="font-bold text-sm">Hard</span>
                                                    <span className="text-[10px] text-white/40">[2]</span>
                                                </button>

                                                <button
                                                    onClick={() => handleRateCard("good")}
                                                    className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-emerald-300 transition hover:bg-emerald-500/20 hover:scale-105"
                                                >
                                                    <span className="font-bold text-sm">Good</span>
                                                    <span className="text-[10px] text-white/40">[3]</span>
                                                </button>

                                                <button
                                                    onClick={() => handleRateCard("easy")}
                                                    className="flex flex-col items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 py-3 text-cyan-300 transition hover:bg-cyan-500/20 hover:scale-105"
                                                >
                                                    <span className="font-bold text-sm">Easy</span>
                                                    <span className="text-[10px] text-white/40">[4]</span>
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <p className="text-xs text-white/40 pt-4">
                                                Reviewed this session: <span className="font-bold text-white">{cardsReviewed} cards</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PHASE 2: NEW MATERIAL & NOTES */}
                            {currentPhase.id === "new" && (
                                <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-2xl space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                        <div>
                                            <h3 className="text-2xl font-black">Capture New Material</h3>
                                            <p className="mt-1 text-sm text-white/60">
                                                Read your textbook, watch your video, and note key concepts here.
                                            </p>
                                        </div>
                                        <BookOpen className="h-8 w-8 text-cyan-400" />
                                    </div>

                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Write new key insights, vocabulary words, or concepts learned during this 10-minute block..."
                                        className="h-56 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white placeholder-white/30 outline-none focus:border-cyan-500/40 transition resize-none leading-relaxed"
                                    />

                                    <div className="flex justify-between items-center text-xs text-white/50">
                                        <span>Notes automatically saved locally</span>
                                        <button
                                            onClick={handleNextPhase}
                                            className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white hover:bg-cyan-400 transition"
                                        >
                                            <span>Proceed to Practice</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PHASE 3: PRACTICE */}
                            {currentPhase.id === "practice" && (
                                <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-2xl space-y-6 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        <Target className="h-8 w-8" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black">Active Practice Challenge</h3>
                                        <p className="mt-2 text-sm text-white/60 max-w-lg mx-auto">
                                            Put your new knowledge to work! Try explaining the main concept out loud or writing a sentence using the new words.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6 text-left space-y-3">
                                        <p className="text-xs font-semibold uppercase text-purple-300 tracking-wider">Quick Drill</p>
                                        <p className="text-base text-white/90">
                                            Can you state 3 main key takeaways from today&apos;s study material without looking at your notes?
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleNextPhase}
                                        className="w-full rounded-2xl bg-purple-500 py-4 font-semibold text-white hover:bg-purple-400 transition"
                                    >
                                        Finish Practice & Reflect
                                    </button>
                                </div>
                            )}

                            {/* PHASE 4: REFLECTION */}
                            {currentPhase.id === "reflect" && (
                                <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-2xl space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                        <div>
                                            <h3 className="text-2xl font-black">Session Reflection</h3>
                                            <p className="mt-1 text-sm text-white/60">
                                                Synthesize your learning session to solidify memory consolidation.
                                            </p>
                                        </div>
                                        <PenTool className="h-8 w-8 text-emerald-400" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-white/80">
                                            How focused did you feel during this session?
                                        </label>

                                        <div className="flex items-center gap-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setFocusRating(star)}
                                                    className={`flex h-12 flex-1 items-center justify-center rounded-2xl border transition ${star <= focusRating
                                                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                                        : "border-white/10 bg-white/5 text-white/30"
                                                        }`}
                                                >
                                                    <Star className={`h-5 w-5 ${star <= focusRating ? "fill-emerald-300" : ""}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-white/80">
                                            Reflection Note (Optional)
                                        </label>
                                        <textarea
                                            value={reflectionText}
                                            onChange={(e) => setReflectionText(e.target.value)}
                                            placeholder="What was the most challenging part of today's study block?"
                                            className="h-32 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/30 outline-none focus:border-emerald-500/40 transition resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSessionCompleted(true);
                                            setIsActive(false);
                                        }}
                                        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-4 font-semibold text-white hover:opacity-90 transition"
                                    >
                                        Complete 30-Min Focus Session 🎉
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* SESSION COMPLETED OVERLAY */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-xl text-center space-y-8 rounded-[40px] border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-slate-900/80 to-[#030611] p-10 sm:p-14 backdrop-blur-3xl shadow-[0_0_80px_rgba(16,185,129,0.2)]"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>

                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Focus Block Completed
                                </span>
                                <h2 className="mt-4 text-4xl font-black">Awesome Work!</h2>
                                <p className="mt-2 text-sm text-white/60">
                                    You completed your {totalSessionDuration}-minute focus block and strengthened your memory retention.
                                </p>
                            </div>

                            {/* STATS GRID */}
                            <div className="grid grid-cols-3 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                                <div>
                                    <p className="text-xs text-white/50">Time Studied</p>
                                    <p className="mt-1 text-2xl font-black text-emerald-300">{totalSessionDuration}m</p>
                                </div>

                                <div>
                                    <p className="text-xs text-white/50">Cards Reviewed</p>
                                    <p className="mt-1 text-2xl font-black text-indigo-300">{cardsReviewed}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-white/50">Focus Level</p>
                                    <p className="mt-1 text-2xl font-black text-amber-300">{focusRating}★</p>
                                </div>
                            </div>

                            <Link
                                href="/app"
                                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-semibold text-white transition hover:bg-emerald-400"
                            >
                                <span>Return to Dashboard</span>
                                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* EXIT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showExitConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 text-center space-y-6 shadow-2xl"
                        >
                            <h3 className="text-2xl font-black">Pause Session?</h3>
                            <p className="text-sm text-white/60">
                                Are you sure you want to exit your active focus block? Your current progress will be saved.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowExitConfirm(false)}
                                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold hover:bg-white/10 transition"
                                >
                                    Resume Study
                                </button>

                                <button
                                    onClick={() => {
                                        if (document.exitFullscreen && document.fullscreenElement) {
                                            document.exitFullscreen().catch(() => { });
                                        }
                                        router.push("/app");
                                    }}
                                    className="flex-1 rounded-2xl bg-red-500 py-3.5 text-sm font-semibold text-white hover:bg-red-400 transition"
                                >
                                    Exit to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}