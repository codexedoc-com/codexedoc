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
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <p className="text-sm text-white/50">Today's Progress</p>
        <div className="mt-2 flex items-center justify-between">
          <h3 className="text-2xl font-black">Your Daily Dashboard</h3>
          <div className="flex items-center gap-2 rounded-2xl bg-green-500/10 px-4 py-2 text-sm text-green-300">
            <Flame className="h-4 w-4" />
            {streak} Day Streak
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:bg-white/8 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/50">{stat.label}</p>
                  <h4 className="mt-2 text-4xl font-black">{stat.value}</h4>
                </div>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
