"use client";

import { Flame, BookOpen, Target, Zap, Clock } from "lucide-react";

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
  onStartReview,
}: TodayProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Today&apos;s Review Queue</h3>
          <p className="text-xs text-zinc-500">Active spaced repetition tasks for today.</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>{streak} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Due Card */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium text-zinc-500">Reviews Due</span>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{reviewsDue}</p>
        </div>

        {/* New Items */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium text-zinc-500">Added Today</span>
            <Zap className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{newItems}</p>
        </div>

        {/* Practice Tasks */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium text-zinc-500">Mastery Target</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{practiceTasks}</p>
        </div>
      </div>
    </div>
  );
}
