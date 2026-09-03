"use client";

import { Play, Sparkles } from "lucide-react";

interface SessionBreakdownProps {
  onStartSession?: () => void;
  dailyMinutes?: number;
}

export function SessionBreakdown({ onStartSession, dailyMinutes = 30 }: SessionBreakdownProps) {
  const segments = [
    { label: "SRS Review", minutes: Math.round(dailyMinutes * 0.45), color: "bg-indigo-600" },
    { label: "New Cards", minutes: Math.round(dailyMinutes * 0.3), color: "bg-cyan-500" },
    { label: "Practice", minutes: Math.round(dailyMinutes * 0.15), color: "bg-purple-500" },
    { label: "Reflect", minutes: Math.round(dailyMinutes * 0.1), color: "bg-emerald-500" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700 mb-1.5">
            <Sparkles className="h-3 w-3" />
            <span>Recommended Session</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-900">{dailyMinutes} Minute Daily Focus Block</h4>
        </div>

        <button
          onClick={onStartSession}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:scale-[0.99] shadow-xs transition cursor-pointer"
        >
          <Play className="h-4 w-4 fill-white" />
          Start Study Session
        </button>
      </div>

      {/* Segments breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 sm:pt-2">
        {segments.map((segment) => (
          <div key={segment.label} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
            <div className={`h-1.5 w-4 rounded-full ${segment.color} mx-auto mb-1.5`} />
            <p className="text-sm font-bold text-zinc-900">{segment.minutes}m</p>
            <p className="text-[11px] text-zinc-500 truncate">{segment.label}</p>
          </div>
        ))}
      </div>

      {/* Segment bar */}
      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={`${segment.color} h-full transition-all`}
            style={{ width: `${(segment.minutes / dailyMinutes) * 100}%` }}
            title={`${segment.label}: ${segment.minutes}m`}
          />
        ))}
      </div>
    </div>
  );
}
