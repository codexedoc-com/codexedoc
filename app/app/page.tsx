"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Menu } from "lucide-react";
import { motion } from "framer-motion";

import { TodayProgress } from "@/components/TodayProgress";
import { SessionBreakdown } from "@/components/SessionBreakdown";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProgressAnalytics } from "@/components/ProgressAnalytics";
import { SkillTree } from "@/components/SkillTree";
import AddItemForm from "@/components/AddItemForm";

import { StatsOverview } from "@/components/StatsOverview";
import { LearningInsights } from "@/components/LearningInsights";

import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  fetchActiveGoal,
  fetchGoalCategories,
  fetchTodayProgress,
  fetchProgressAnalytics,
  fetchStatistics,
  fetchSkillTree,
  fetchLearningInsights,
} from "@/server/actions/queryActions";

interface TodayProgressStats {
  reviewsDue: number;
  newItems: number;
  practiceTasks: number;
  streak: number;
}

interface ProgressAnalyticsStats {
  progressPercent: number;
  itemsMastered: number;
  retentionRate: number;
  streak: number;
}

interface StatisticsStats {
  totalItemsAdded: number;
  itemsMastered: number;
  reviewsCompleted: number;
  minutesStudied: number;
  averageSessionLength: number;
  consecutiveDaysActive: number;
}

interface SkillTreeStats {
  name: string;
  percentage: number;
  children?: Array<{
    name: string;
    percentage: number;
    children?: Array<{ name: string; percentage: number }>;
  }>;
}

interface LearningInsightsStats {
  daysOfLearning: number;
  hasEnoughData?: boolean;
  bestStudyTime?: string;
  bestSessionLength?: number;
  highestRetentionDay?: string;
  lowestRetentionDay?: string;
  averageRecall?: number;
  mostEffectiveMethod?: string;
  leastEffectiveMethod?: string;
}

interface DashboardData {
  user: { id?: string } | null;
  goal: { id?: string; title?: string } | null;
  categories: Array<{ id: string; name: string; itemCount: number }>;
  todayStats: TodayProgressStats;
  progressStats: ProgressAnalyticsStats;
  statistics: StatisticsStats;
  skillTree: SkillTreeStats;
  insights: LearningInsightsStats;
  loading: boolean;
}

const defaultTodayStats: TodayProgressStats = {
  reviewsDue: 0,
  newItems: 0,
  practiceTasks: 0,
  streak: 0,
};

const defaultProgressStats: ProgressAnalyticsStats = {
  progressPercent: 0,
  itemsMastered: 0,
  retentionRate: 0,
  streak: 0,
};

const defaultStatistics: StatisticsStats = {
  totalItemsAdded: 0,
  itemsMastered: 0,
  reviewsCompleted: 0,
  minutesStudied: 0,
  averageSessionLength: 0,
  consecutiveDaysActive: 0,
};

const defaultSkillTree: SkillTreeStats = {
  name: "Overall Learning",
  percentage: 0,
  children: [],
};

const defaultInsights: LearningInsightsStats = {
  daysOfLearning: 0,
  hasEnoughData: false,
};

export default function DashboardPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [data, setData] = useState<DashboardData>({
    user: null,
    goal: null,
    categories: [],
    todayStats: defaultTodayStats,
    progressStats: defaultProgressStats,
    statistics: defaultStatistics,
    skillTree: defaultSkillTree,
    insights: defaultInsights,
    loading: true,
  });

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const user = await getCurrentUser();
        const userId = user?.id;

        let goal: DashboardData["goal"] = null;
        let todayStats: DashboardData["todayStats"] = defaultTodayStats;
        let progressStats: DashboardData["progressStats"] = defaultProgressStats;
        let statistics: DashboardData["statistics"] = defaultStatistics;
        let skillTree: DashboardData["skillTree"] = defaultSkillTree;
        let insights: DashboardData["insights"] = defaultInsights;
        let categories: DashboardData["categories"] = [];

        if (userId) {
          [goal, todayStats, progressStats, statistics, skillTree, insights] =
            await Promise.all([
              fetchActiveGoal(userId),
              fetchTodayProgress(userId, ""),
              fetchProgressAnalytics(userId, ""),
              fetchStatistics(userId),
              fetchSkillTree(userId),
              fetchLearningInsights(userId),
            ]);

          if (goal?.id) {
            categories = await fetchGoalCategories(goal.id);
          }
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

  // Redirect to create page if no goal after loading
  useEffect(() => {
    if (!data.loading && !data.goal) {
      router.replace("/app/create");
    }
  }, [data.loading, data.goal, router]);

  if (data.loading) {
    return (
      <main className="relative min-h-screen bg-[#050816] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center">
              <div className="inline-block h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <p className="mt-4 text-white/60">Loading your dashboard...</p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (!data.goal) {
    return (
      <main className="relative min-h-screen bg-[#050816] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-white/60">Redirecting to goal creation...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#050816] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
      <div className="absolute left-1/2 top-0 h-150 w-150 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[70px_70px]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/5">
              <Image
                src="/codexedoc.png"
                alt="CODEXEDOC Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wide">CODEXEDOC</h1>
            </div>
          </Link>

          {/* Goal Display */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:flex items-center gap-4"
          >
            <div className="text-right">
              <p className="text-xs text-white/50">Current Goal</p>
              <p className="text-lg font-black truncate">{data.goal?.title}</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button className="hidden sm:flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl truncate">{data.goal?.title}</h2>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/60">
              Track your progress, organize your learning blueprint, and master your goal systematically.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-4">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-12">
              <TodayProgress {...data.todayStats} />
              <SessionBreakdown />
              <CategoriesSection
                categories={data.categories}
                onCreateCategory={() => console.log("Create category")}
              />
              <SkillTree />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <ProgressAnalytics {...data.progressStats} />
              <StatsOverview {...data.statistics} />
              <LearningInsights {...data.insights} />

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl space-y-3 sm:space-y-4"
              >
                <p className="text-xs sm:text-sm text-white/50">Quick Actions</p>

                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="w-full rounded-2xl bg-indigo-500 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-indigo-400 transition"
                >
                  Add Knowledge
                </button>

                {showAddItemModal && (
                  <AddItemForm
                    userId={data.user?.id}
                    categories={data.categories}
                    onClose={() => setShowAddItemModal(false)}
                    onCreated={() => {
                      setShowAddItemModal(false);
                      router.refresh();
                    }}
                  />
                )}

                <button className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-white/10 transition">
                  View Stats
                </button>

                <button
                  onClick={() => router.push(`/app/create?userId=${data.user?.id || ""}`)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-white/10 transition"
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