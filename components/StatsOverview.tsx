"use client";

import { Target, Zap, Clock, Calendar } from "lucide-react";

interface StatsOverviewProps {
  totalItemsAdded: number;
  itemsMastered: number;
  reviewsCompleted: number;
  minutesStudied: number;
  averageSessionLength: number;
  consecutiveDaysActive: number;
}

export function StatsOverview({
  totalItemsAdded,
  itemsMastered,
  reviewsCompleted,
  minutesStudied,
  averageSessionLength,
  consecutiveDaysActive,
}: StatsOverviewProps) {
  const stats = [
    { label: "Total Knowledge Cards", value: totalItemsAdded, icon: Target },
    { label: "Reviews Completed", value: reviewsCompleted, icon: Zap },
    { label: "Minutes Studied", value: `${minutesStudied}m`, icon: Clock },
    { label: "Active Days", value: consecutiveDaysActive, icon: Calendar },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-zinc-900">Overall Activity</h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
                <Icon className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
