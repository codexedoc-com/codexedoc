"use client";

import { motion } from "framer-motion";
import { Target, BarChart3, Flame } from "lucide-react";

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
  const stats = [
    { label: "Overall Progress", value: `${progressPercent}%`, icon: BarChart3 },
    { label: "Items Mastered", value: itemsMastered.toString(), icon: Target },
    { label: "Retention Rate", value: `${retentionRate}%`, icon: BarChart3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <p className="text-sm text-white/50">Your Progress</p>
        <h3 className="mt-1 text-2xl font-black">Learning Analytics</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-indigo-500/30 hover:bg-white/8 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">{stat.label}</p>
                  <h4 className="mt-3 text-3xl font-black">{stat.value}</h4>
                </div>
                <Icon className="h-8 w-8 text-indigo-300/40" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Learning Journey</h4>
          <span className="text-lg font-black">{progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
