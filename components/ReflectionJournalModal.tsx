"use client";

import { useState, useEffect } from "react";
import { BookOpen, X, Clock, Calendar, Sparkles, ArrowRight, Lightbulb, Target, AlertCircle } from "lucide-react";
import { fetchReflections } from "@/server/actions/queryActions";

interface ReflectionItem {
  id: string;
  sessionId: string;
  learned: string | null;
  difficulty: string | null;
  confusion: string | null;
  improvement: string | null;
  focusTomorrow: string | null;
  createdAt: Date;
  durationMinutes: number;
}

interface ReflectionJournalModalProps {
  userId: string;
  onClose: () => void;
  onStartSession?: () => void;
}

export function ReflectionJournalModal({
  userId,
  onClose,
  onStartSession,
}: ReflectionJournalModalProps) {
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReflections(userId);
        setReflections(data);
      } catch (err) {
        console.error("Failed to load reflections:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">Reflection Journal</h2>
              <p className="text-xs text-zinc-500">Your study takeaways, insights, and next steps</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-7 w-7 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
              <p className="mt-3 text-xs text-zinc-500 font-medium">Loading your journal entries...</p>
            </div>
          ) : reflections.length === 0 ? (
            <div className="py-12 sm:py-16 text-center max-w-md mx-auto px-4">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3.5">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">No reflections recorded yet</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-6">
                After completing a flashcard or active recall session, you can jot down key takeaways and what to focus on next. They will appear here in your learning timeline.
              </p>
              {onStartSession && (
                <button
                  onClick={() => {
                    onClose();
                    onStartSession();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-500 transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Practice Session</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reflections.map((ref) => {
                const date = new Date(ref.createdAt);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={ref.id}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 hover:bg-white hover:border-indigo-200 transition duration-150 space-y-3"
                  >
                    {/* Entry Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{formattedDate}</span>
                        <span className="text-zinc-400 font-normal">at {formattedTime}</span>
                      </div>

                      {ref.durationMinutes > 0 && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
                          <Clock className="h-3 w-3" />
                          <span>{ref.durationMinutes}m studied</span>
                        </div>
                      )}
                    </div>

                    {/* Learned / Takeaway */}
                    {ref.learned && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <Lightbulb className="h-3.5 w-3.5" />
                          <span>Key Takeaway</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-emerald-50/40 border border-emerald-100/60 rounded-xl p-3">
                          {ref.learned}
                        </p>
                      </div>
                    )}

                    {/* Focus Tomorrow */}
                    {ref.focusTomorrow && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                          <Target className="h-3.5 w-3.5" />
                          <span>Next Learning Focus</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-indigo-50/40 border border-indigo-100/60 rounded-xl p-3">
                          {ref.focusTomorrow}
                        </p>
                      </div>
                    )}

                    {/* Difficulties or Confusion */}
                    {(ref.difficulty || ref.confusion) && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Challenges & Questions</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-amber-50/40 border border-amber-100/60 rounded-xl p-3">
                          {ref.difficulty || ref.confusion}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs text-zinc-500 flex-shrink-0">
          <span>{reflections.length} {reflections.length === 1 ? "entry" : "entries"} recorded</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
