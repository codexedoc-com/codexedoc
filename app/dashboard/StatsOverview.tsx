"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Zap, Target } from "lucide-react";

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
    {
      label: "Total Items",
      value: totalItemsAdded,
      icon: Target,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Mastered",
      value: itemsMastered,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Reviews Done",
      value: reviewsCompleted,
      icon: Zap,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      label: "Minutes Studied",
      value: minutesStudied,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <p className="text-sm text-white/50">Overall Statistics</p>
        <h3 className="mt-1 text-2xl font-black">Your Learning Stats</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className={`relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl border border-white/10`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
              />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <h4 className="mt-3 text-3xl font-black text-white">
                      {stat.value.toLocaleString()}
                    </h4>
                  </div>
                  <Icon className="h-8 w-8 text-white/30" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm text-white/50">Avg. Session Length</p>
          <p className="mt-3 text-3xl font-black">{averageSessionLength} min</p>
          <p className="mt-2 text-xs text-white/40">
            You're most productive in these sessions
          </p>
        </div>

        <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6 backdrop-blur-xl">
          <p className="text-sm text-indigo-200">Mastery Rate</p>
          <p className="mt-3 text-3xl font-black">
            {itemsMastered > 0
              ? Math.round((itemsMastered / totalItemsAdded) * 100)
              : 0}
            %
          </p>
          <p className="mt-2 text-xs text-indigo-200/60">
            {itemsMastered} of {totalItemsAdded} items mastered
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
