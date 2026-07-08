"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, TrendingUp, Brain } from "lucide-react";

interface LearningInsightsProps {
  bestStudyTime?: string;
  bestSessionLength?: number;
  highestRetentionDay?: string;
  lowestRetentionDay?: string;
  averageRecall?: number;
  mostEffectiveMethod?: string;
  leastEffectiveMethod?: string;
  daysOfLearning?: number;
}

export function LearningInsights({
  bestStudyTime = "7:00 PM - 8:00 PM",
  bestSessionLength = 34,
  highestRetentionDay = "Tuesday",
  lowestRetentionDay = "Saturday",
  averageRecall = 86,
  mostEffectiveMethod = "Active Recall",
  leastEffectiveMethod = "Passive Reading",
  daysOfLearning = 0,
}: LearningInsightsProps) {
  const insights = [
    {
      icon: Clock,
      label: "Best Study Time",
      value: bestStudyTime,
      color: "text-indigo-300",
    },
    {
      icon: TrendingUp,
      label: "Best Session Length",
      value: `${bestSessionLength} minutes`,
      color: "text-cyan-300",
    },
    {
      icon: Brain,
      label: "Highest Retention",
      value: highestRetentionDay,
      color: "text-green-300",
    },
    {
      icon: Brain,
      label: "Lowest Retention",
      value: lowestRetentionDay,
      color: "text-yellow-300",
    },
  ];

  if (daysOfLearning < 30) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6 sm:p-8 backdrop-blur-xl space-y-3 sm:space-y-4 text-center"
      >
        <Sparkles className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-indigo-300" />
        <div>
          <h3 className="text-lg sm:text-xl font-black">Learning Operating Manual</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-indigo-200/80">
            After 30 days of consistent learning, we&apos;ll create your personalized
            operating manual with insights about how you learn best.
          </p>
        </div>
        <div className="mt-3 sm:mt-4 text-xs text-indigo-200/60">
          {daysOfLearning > 0 && `${daysOfLearning} day${daysOfLearning !== 1 ? "s" : ""} completed`}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-300 flex-shrink-0" />
        <div className="text-left">
          <p className="text-xs sm:text-sm text-white/50">AI-Generated Insights</p>
          <h3 className="text-lg sm:text-2xl font-black">Your Learning Operating Manual</h3>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${insight.color} flex-shrink-0`} />
                <div>
                  <p className="text-xs sm:text-sm text-white/50">{insight.label}</p>
                  <p className="mt-1 sm:mt-2 text-base sm:text-lg font-black text-white">
                    {insight.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid gap-3 grid-cols-1 sm:grid-cols-2"
      >
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <p className="text-xs sm:text-sm text-white/50">Average Recall Rate</p>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-black">{averageRecall}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${averageRecall}%` }}
              transition={{ duration: 1, delay: 0.9 }}
              className="h-full bg-gradient-to-r from-green-500 to-cyan-400"
            />
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <p className="text-xs sm:text-sm text-white/50">Most Effective Method</p>
          <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black text-indigo-300">
            {mostEffectiveMethod}
          </p>
          <p className="mt-2 sm:mt-3 text-xs text-white/50">
            vs. {leastEffectiveMethod} (least effective)
          </p>
        </div>
      </motion.div>

      {/* Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-4 sm:p-8 backdrop-blur-xl"
      >
        <h4 className="text-sm sm:text-base font-bold text-indigo-200">💡 Personalized Recommendation</h4>
        <p className="mt-2 sm:mt-4 text-xs sm:text-sm leading-relaxed text-white/80">
          You learn best with {bestSessionLength}–40 minute evening sessions followed by
          active recall reviews. This data-driven insight is unique to how your brain works.
          Use these optimal conditions to accelerate your mastery.
        </p>
      </motion.div>
    </motion.div>
  );
}
