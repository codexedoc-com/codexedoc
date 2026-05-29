"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";

export function SessionBreakdown() {
  const segments = [
    { label: "Review", minutes: 10, color: "bg-indigo-500" },
    { label: "New Material", minutes: 10, color: "bg-cyan-500" },
    { label: "Practice", minutes: 5, color: "bg-purple-500" },
    { label: "Reflect", minutes: 5, color: "bg-green-500" },
  ];

  const totalMinutes = segments.reduce((sum, seg) => sum + seg.minutes, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-8 backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-indigo-200/70">Recommended Session</p>
          <h4 className="mt-2 text-2xl font-black">{totalMinutes} Minute Focus Block</h4>
        </div>
        <Target className="h-8 w-8 text-indigo-300" />
      </div>

      {/* Time Breakdown */}
      <div className="grid grid-cols-4 gap-3">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
          >
            <div className={`h-1 rounded-full ${segment.color} mx-auto mb-3`} style={{ width: "24px" }} />
            <p className="text-lg font-bold text-white">{segment.minutes}m</p>
            <p className="mt-1 text-xs text-white/60">{segment.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2">
        <p className="text-sm text-white/50">Session Breakdown</p>
        <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-white/5">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.label}
              initial={{ width: 0 }}
              animate={{ width: `${(segment.minutes / totalMinutes) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
              className={`${segment.color} transition-all`}
              title={`${segment.label}: ${segment.minutes}m`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-4 font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/50">
        Start Session
      </button>
    </motion.div>
  );
}
