"use client";

import { motion } from "framer-motion";
import { Flame, BookOpen, Target, Zap } from "lucide-react";

interface TodayProgressProps {
  reviewsDue: number;
  newItems: number;
  practiceTasks: number;
  streak: number;
}

export function TodayProgress({
  reviewsDue,
  newItems,
  practiceTasks,
  streak,
}: TodayProgressProps) {
  const stats = [
    { label: "Reviews Due", value: reviewsDue, icon: BookOpen, color: "text-indigo-300" },
    { label: "New Items", value: newItems, icon: Zap, color: "text-cyan-300" },
    { label: "Practice Tasks", value: practiceTasks, icon: Target, color: "text-cyan-300" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div>
        <p className="text-sm text-white/50">Today&apos;s Progress</p>
        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
          <h3 className="text-xl sm:text-2xl font-black">Your Daily Dashboard</h3>
          <div className="flex items-center gap-2 rounded-2xl bg-green-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm text-green-300">
            <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
            {streak} Day Streak
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-5 backdrop-blur-xl hover:bg-white/8 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm text-white/50">{stat.label}</p>
                  <h4 className="mt-1 sm:mt-2 text-2xl sm:text-4xl font-black">{stat.value}</h4>
                </div>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
