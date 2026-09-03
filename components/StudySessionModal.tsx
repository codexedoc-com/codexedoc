"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  Brain,
  HelpCircle,
  ThumbsUp,
  Zap,
} from "lucide-react";
import {
  fetchDueReviews,
  submitCardReviewAction,
  completeStudySessionAction,
  ReviewItem,
} from "@/server/actions/studyActions";

interface StudySessionModalProps {
  userId: string;
  categoryId?: string;
  categoryName?: string;
  onClose: () => void;
  onComplete: () => void;
}

export function StudySessionModal({
  userId,
  categoryId,
  categoryName,
  onClose,
  onComplete,
}: StudySessionModalProps) {
  const [cards, setCards] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [startTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reflection state
  const [learnedNote, setLearnedNote] = useState("");
  const [focusTomorrowNote, setFocusTomorrowNote] = useState("");
  const [savingSession, setSavingSession] = useState(false);

  // Timer
  useEffect(() => {
    if (sessionCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionCompleted]);

  // Load cards
  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      const data = await fetchDueReviews(userId, categoryId);
      setCards(data);
      setLoading(false);
    }
    loadCards();
  }, [userId, categoryId]);

  const currentCard = cards[currentIndex];

  const handleRate = useCallback(
    async (rating: number) => {
      if (!currentCard) return;

      // Submit SM-2 review
      await submitCardReviewAction(currentCard.id, currentCard.itemId, rating);
      setReviewedCount((prev) => prev + 1);

      setIsFlipped(false);
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    },
    [currentCard, currentIndex, cards.length]
  );

  // Keyboard shortcuts (Space to flip, 1-4 to rate)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (sessionCompleted) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1") handleRate(1);
        else if (e.key === "2") handleRate(2);
        else if (e.key === "3") handleRate(3);
        else if (e.key === "4") handleRate(4);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, handleRate, sessionCompleted]);

  const handleFinish = async () => {
    setSavingSession(true);
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    await completeStudySessionAction(durationMinutes, reviewedCount, {
      learned: learnedNote,
      focusTomorrow: focusTomorrowNote,
    });
    setSavingSession(false);
    onComplete();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs flex-shrink-0">
              <Brain className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider truncate">
                {categoryName ? `Practice: ${categoryName}` : "Active Spaced Review"}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Clock className="h-3 w-3" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {!sessionCompleted && cards.length > 0 && (
              <span className="text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-zinc-100 text-zinc-700">
                {currentIndex + 1} / {cards.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
              <p className="mt-3 text-sm text-zinc-500 font-medium">Preparing review queue...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">All caught up for today!</h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                You have no reviews due right now. Create more items or check back tomorrow to keep your streak going.
              </p>
              <button
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          ) : sessionCompleted ? (
            /* Post-Session Summary */
            <div className="py-4 sm:py-6 space-y-6">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Session Complete!</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Great work! You strengthened your memory for {reviewedCount} items.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto">
                <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
                  <p className="text-xs font-medium text-zinc-500">Cards Reviewed</p>
                  <p className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">{reviewedCount}</p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-center">
                  <p className="text-xs font-medium text-zinc-500">Time Studied</p>
                  <p className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">{formatTime(elapsedSeconds)}</p>
                </div>
              </div>

              {/* Reflection */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-zinc-700">
                  Quick Reflection (Optional): What was your biggest takeaway?
                </label>
                <textarea
                  rows={2}
                  value={learnedNote}
                  onChange={(e) => setLearnedNote(e.target.value)}
                  placeholder="e.g. Mastered the difference between props and state..."
                  className="w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleFinish}
                  disabled={savingSession}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50"
                >
                  {savingSession ? "Saving Progress..." : "Save & Complete Session"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Active Flashcard Interface */
            <div className="space-y-4 sm:space-y-6">
              {/* Flashcard Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`group relative min-h-[220px] sm:min-h-[260px] p-5 sm:p-8 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none active:scale-[0.99] ${
                  isFlipped
                    ? "bg-indigo-50/30 border-indigo-200/80 shadow-xs"
                    : "bg-white border-zinc-200/80 hover:border-zinc-300 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-zinc-100 text-zinc-600 max-w-[160px] sm:max-w-none truncate">
                      {currentCard?.categoryName || "General"}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {isFlipped ? "Answer" : "Question / Prompt"}
                    </span>
                  </div>

                  <p className="text-lg sm:text-2xl font-semibold text-zinc-900 leading-relaxed break-words">
                    {isFlipped ? currentCard?.answer : currentCard?.prompt}
                  </p>
                </div>

                <div className="pt-4 sm:pt-6 mt-3 sm:mt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] sm:text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Tap or Space to {isFlipped ? "hide" : "reveal"}
                  </span>
                  <span className="capitalize text-zinc-500 font-medium">
                    Type: {currentCard?.type}
                  </span>
                </div>
              </div>

              {/* Rating Actions (SM-2) */}
              {isFlipped ? (
                <div className="space-y-2">
                  <p className="text-[11px] sm:text-xs text-center font-medium text-zinc-500">
                    How well did you remember this?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRate(1)}
                      className="p-2.5 sm:p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 active:bg-rose-200 font-semibold text-xs transition text-center cursor-pointer"
                    >
                      <span className="block font-bold">1. Again</span>
                      <span className="text-[10px] opacity-75">&lt; 1 min</span>
                    </button>
                    <button
                      onClick={() => handleRate(2)}
                      className="p-2.5 sm:p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 active:bg-amber-200 font-semibold text-xs transition text-center cursor-pointer"
                    >
                      <span className="block font-bold">2. Hard</span>
                      <span className="text-[10px] opacity-75">1 day</span>
                    </button>
                    <button
                      onClick={() => handleRate(3)}
                      className="p-2.5 sm:p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 active:bg-indigo-200 font-semibold text-xs transition text-center cursor-pointer"
                    >
                      <span className="block font-bold">3. Good</span>
                      <span className="text-[10px] opacity-75">3 days</span>
                    </button>
                    <button
                      onClick={() => handleRate(4)}
                      className="p-2.5 sm:p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:bg-emerald-200 font-semibold text-xs transition text-center cursor-pointer"
                    >
                      <span className="block font-bold">4. Easy</span>
                      <span className="text-[10px] opacity-75">7 days</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 active:bg-black transition cursor-pointer shadow-xs"
                >
                  Show Answer (Space)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
