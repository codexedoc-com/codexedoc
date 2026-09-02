"use client";

import { Target, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";

interface ProgressAnalyticsProps {
  progressPercent: number;
  itemsMastered: number;
  retentionRate: number;
  streak: number;
}

export function ProgressAnalytics({
  progressPercent,
  itemsMastered,
  retentionRate,
  streak,
}: ProgressAnalyticsProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Retention & Analytics</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {retentionRate}% Accuracy
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
          <span className="text-xs text-zinc-500 font-medium">Items Mastered</span>
          <p className="text-xl font-bold text-zinc-900 mt-1">{itemsMastered}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
          <span className="text-xs text-zinc-500 font-medium">Goal Progress</span>
          <p className="text-xl font-bold text-zinc-900 mt-1">{progressPercent}%</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>Overall Retention Target</span>
          <span>85% Target</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (retentionRate / 85) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
