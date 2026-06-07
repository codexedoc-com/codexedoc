"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, Menu } from "lucide-react";
import { motion } from "framer-motion";

import { TodayProgress } from "@/components/TodayProgress";
import { SessionBreakdown } from "@/components/SessionBreakdown";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProgressAnalytics } from "@/components/ProgressAnalytics";
import { SkillTree } from "@/components/SkillTree";
import { GoalCreationFlow } from "@/components/GoalCreationFlow";
import { StatsOverview } from "@/components/StatsOverview";
import { LearningInsights } from "@/components/LearningInsights";
import {
  getCurrentUser,
  getActiveGoal,
  getGoalCategories,
  getTodayProgress,
  getProgressAnalytics,
  getStatistics,
  getSkillTree,
  getLearningInsights,
  createGoalAction,
  createLearningAreaAction,
} from "@/server/queries/dashboardQueries";

interface DashboardData {
  user: any;
  goal: any;
  categories: any[];
  todayStats: any;
  progressStats: any;
  statistics: any;
  skillTree: any;
  insights: any;
  loading: boolean;
}

export default function DashboardPage() {
  const [showGoalCreation, setShowGoalCreation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<DashboardData>({
    user: null,
    goal: null,
    categories: [],
    todayStats: {},
    progressStats: {},
    statistics: {},
    skillTree: {},
    insights: {},
    loading: true,
  });

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // For demo: using fixed user ID. In production, get from session/auth
        const demoUserId = "demo-user-001";

        const [user, goal, todayStats, progressStats, statistics, skillTree, insights] = await Promise.all([
          getCurrentUser(demoUserId),
          getActiveGoal(demoUserId),
          getTodayProgress(demoUserId, ""),
          getProgressAnalytics(demoUserId, ""),
          getStatistics(demoUserId),
          getSkillTree(demoUserId),
          getLearningInsights(demoUserId),
        ]);

        let categories = [];
        if (goal?.id) {
          categories = await getGoalCategories(goal.id);
        }

        setData({
          user,
          goal,
          categories,
          todayStats,
          progressStats,
          statistics,
          skillTree,
          insights,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    loadDashboard();
  }, []);

  if (data.loading) {
    return (
      <main className="relative min-h-screen bg-[#050816] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
        <div className="flex min-h-screen items-center justify-center">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="text-center">
              <div className="inline-block h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <p className="mt-4 text-white/60">Loading your dashboard...</p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (showGoalCreation) {
    return (
      <GoalCreationFlow
        onClose={() => setShowGoalCreation(false)}
        onGoalCreated={() => {
          setShowGoalCreation(false);
          // Reload data
          window.location.reload();
        }}
      />
    );
  }

  if (!data.goal) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:70px_70px]" />

        {/* Center Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
          <div className="max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-5xl font-black leading-tight sm:text-6xl">
                  Welcome to
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    CODEXEDOC
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65">
                  {data.user?.username}, create your first learning goal and start building your personal learning system.
                </p>
              </div>

              <button
                onClick={() => setShowGoalCreation(true)}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 font-semibold text-white hover:shadow-lg hover:shadow-indigo-500/50 transition"
              >
                Create Your First Goal
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#050816] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:70px_70px]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <Image
                src="/codexedoc.png"
                alt="CODEXEDOC Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide">CODEXEDOC</h1>
            </div>
          </Link>

          {/* Goal Display */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-4"
          >
            <div className="text-right">
              <p className="text-xs text-white/50">Current Goal</p>
              <p className="text-lg font-black">{data.goal?.title}</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition">
              <Settings className="h-5 w-5" />
            </button>

            <button className="hidden sm:flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition">
              <LogOut className="h-5 w-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-black sm:text-4xl">{data.goal?.title}</h2>
            <p className="mt-2 text-white/60">
              Track your progress, organize your learning blueprint, and master your goal systematically.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Today's Progress */}
              <TodayProgress {...data.todayStats} />

              {/* Session Breakdown */}
              <SessionBreakdown />

              {/* Categories */}
              <CategoriesSection
                categories={data.categories}
                onCreateCategory={() => console.log("Create category")}
              />

              {/* Skill Tree */}
              <SkillTree />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Analytics */}
              <ProgressAnalytics {...data.progressStats} />

              {/* Stats Overview */}
              <StatsOverview {...data.statistics} />

              {/* Learning Insights */}
              <LearningInsights {...data.insights} />

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4"
              >
                <p className="text-sm text-white/50">Quick Actions</p>

                <button className="w-full rounded-2xl bg-indigo-500 py-3 font-semibold hover:bg-indigo-400 transition">
                  Add Knowledge
                </button>

                <button className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold hover:bg-white/10 transition">
                  View Stats
                </button>

                <button
                  onClick={() => setShowGoalCreation(true)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold hover:bg-white/10 transition"
                >
                  New Goal
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}