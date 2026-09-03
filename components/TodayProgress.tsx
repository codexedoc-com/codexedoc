"use client";

import { Flame, BookOpen, Target, Zap } from "lucide-react";

interface TodayProgressProps {
  reviewsDue: number;
  newItems: number;
  practiceTasks: number;
  streak: number;
  onStartReview?: () => void;
}

export function TodayProgress({
  reviewsDue,
  newItems,
  practiceTasks,
  streak,
}: TodayProgressProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900">Today&apos;s Review Queue</h3>
          <p className="text-[11px] sm:text-xs text-zinc-500">Active spaced repetition tasks for today.</p>
        </div>

        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] sm:text-xs font-semibold text-amber-800 flex-shrink-0">
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-500 text-amber-500" />
          <span>{streak} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Due Card */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 truncate">Reviews Due</span>
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{reviewsDue}</p>
        </div>

        {/* New Items */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 truncate">Added Today</span>
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-600 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{newItems}</p>
        </div>

        {/* Practice Tasks */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 truncate">Mastery Goal</span>
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{practiceTasks}</p>
        </div>
      </div>
    </div>
  );
}
