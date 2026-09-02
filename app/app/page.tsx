"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  Plus,
  Brain,
  Sparkles,
  Flame,
  Layers,
  CheckCircle2,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

import { TodayProgress } from "@/components/TodayProgress";
import { SessionBreakdown } from "@/components/SessionBreakdown";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProgressAnalytics } from "@/components/ProgressAnalytics";
import { SkillTree } from "@/components/SkillTree";
import { StatsOverview } from "@/components/StatsOverview";
import AddItemForm from "@/components/AddItemForm";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import { StudySessionModal } from "@/components/StudySessionModal";
import { CategoryDetailModal } from "@/components/CategoryDetailModal";

import { getCurrentUser } from "@/lib/getCurrentUser";
import { logoutAction } from "@/server/actions/auth/logout";
import {
  fetchActiveGoal,
  fetchGoalCategories,
  fetchTodayProgress,
  fetchProgressAnalytics,
  fetchStatistics,
  fetchSkillTree,
} from "@/server/actions/queryActions";

interface DashboardData {
  user: { id?: string; username?: string; email?: string } | null;
  goal: { id?: string; title?: string; dailyMinutes?: number | null } | null;
  categories: Array<{ id: string; name: string; itemCount: number }>;
  todayStats: { reviewsDue: number; newItems: number; practiceTasks: number; streak: number };
  progressStats: { progressPercent: number; itemsMastered: number; retentionRate: number; streak: number };
  statistics: {
    totalItemsAdded: number;
    itemsMastered: number;
    reviewsCompleted: number;
    minutesStudied: number;
    averageSessionLength: number;
    consecutiveDaysActive: number;
  };
  skillTree: {
    name: string;
    percentage: number;
    children?: Array<{ name: string; percentage: number; children?: Array<{ name: string; percentage: number }> }>;
  };
  loading: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | undefined>(undefined);
  const [activeCategoryDetailId, setActiveCategoryDetailId] = useState<string | null>(null);

  const [data, setData] = useState<DashboardData>({
    user: null,
    goal: null,
    categories: [],
    todayStats: { reviewsDue: 0, newItems: 0, practiceTasks: 0, streak: 0 },
    progressStats: { progressPercent: 0, itemsMastered: 0, retentionRate: 0, streak: 0 },
    statistics: {
      totalItemsAdded: 0,
      itemsMastered: 0,
      reviewsCompleted: 0,
      minutesStudied: 0,
      averageSessionLength: 0,
      consecutiveDaysActive: 0,
    },
    skillTree: { name: "Overall Learning", percentage: 0, children: [] },
    loading: true,
  });

  const loadDashboard = async () => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id;

      if (!userId) {
        router.replace("/auth");
        return;
      }

      const [goal, todayStats, progressStats, statistics, skillTree] = await Promise.all([
        fetchActiveGoal(userId),
        fetchTodayProgress(userId, ""),
        fetchProgressAnalytics(userId, ""),
        fetchStatistics(userId),
        fetchSkillTree(userId),
      ]);

      let categories: DashboardData["categories"] = [];
      if (goal?.id) {
        categories = await fetchGoalCategories(goal.id);
      }

      setData({
        user,
        goal,
        categories,
        todayStats,
        progressStats,
        statistics,
        skillTree,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Redirect to /create if user has no goal
  useEffect(() => {
    if (!data.loading && !data.goal) {
      router.replace("/create");
    }
  }, [data.loading, data.goal, router]);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  if (data.loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <p className="mt-3 text-sm text-zinc-500 font-medium">Loading your learning workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand & Goal Pill */}
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/app" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-200">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-zinc-900 hidden sm:inline">CODEXEDOC</span>
            </Link>

            {data.goal && (
              <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            )}

            {data.goal && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/60 text-xs font-semibold text-zinc-800 max-w-[200px] sm:max-w-xs truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="truncate">{data.goal.title}</span>
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedCategoryName(undefined);
                setShowStudyModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition cursor-pointer"
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Review ({data.todayStats.reviewsDue})</span>
            </button>

            <button
              onClick={() => setShowAddItemModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Card</span>
            </button>

            <div className="h-4 w-px bg-zinc-200" />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        {/* Goal Hero Banner */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
              <span>Active Learning Goal</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">{data.goal?.dailyMinutes || 30} mins daily</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              {data.goal?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/create?userId=${data.user?.id || ""}`)}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer"
            >
              Change Goal
            </button>
            <button
              onClick={() => setShowCreateCategoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer shadow-xs"
            >
              + New Topic
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column (2 Cols) - Study & Topics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Queue */}
            <TodayProgress
              {...data.todayStats}
              onStartReview={() => setShowStudyModal(true)}
            />

            {/* Daily Focus Block */}
            <SessionBreakdown
              dailyMinutes={data.goal?.dailyMinutes || 30}
              onStartSession={() => {
                setSelectedCategoryId(null);
                setSelectedCategoryName(undefined);
                setShowStudyModal(true);
              }}
            />

            {/* Blueprint Topics */}
            <CategoriesSection
              categories={data.categories}
              onCreateCategory={() => setShowCreateCategoryModal(true)}
              onSelectCategory={(catId) => setActiveCategoryDetailId(catId)}
            />

            {/* Dynamic Skill Tree */}
            <SkillTree treeData={data.skillTree} />
          </div>

          {/* Right Column (1 Col) - Analytics & Quick Controls */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</p>

              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedCategoryName(undefined);
                  setShowStudyModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition cursor-pointer shadow-xs"
              >
                <Brain className="h-4 w-4" />
                Start Flashcard Session
              </button>

              <button
                onClick={() => setShowAddItemModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold text-sm hover:bg-zinc-50 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Knowledge Card
              </button>

              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold text-sm hover:bg-zinc-50 transition cursor-pointer"
              >
                <Layers className="h-4 w-4" />
                Add Topic / Module
              </button>
            </div>

            {/* Progress & Retention */}
            <ProgressAnalytics {...data.progressStats} />

            {/* Lifetime Stats */}
            <StatsOverview {...data.statistics} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStudyModal && data.user?.id && (
        <StudySessionModal
          userId={data.user.id}
          categoryId={selectedCategoryId || undefined}
          categoryName={selectedCategoryName}
          onClose={() => setShowStudyModal(false)}
          onComplete={() => {
            setShowStudyModal(false);
            loadDashboard();
          }}
        />
      )}

      {activeCategoryDetailId && (
        <CategoryDetailModal
          categoryId={activeCategoryDetailId}
          onClose={() => setActiveCategoryDetailId(null)}
          onAddItem={(catId) => {
            setSelectedCategoryId(catId);
            setShowAddItemModal(true);
          }}
          onStartCategoryPractice={(catId, catName) => {
            setActiveCategoryDetailId(null);
            setSelectedCategoryId(catId);
            setSelectedCategoryName(catName);
            setShowStudyModal(true);
          }}
          onCategoryDeleted={() => {
            setActiveCategoryDetailId(null);
            loadDashboard();
          }}
        />
      )}

      {showAddItemModal && (
        <AddItemForm
          userId={data.user?.id}
          categories={data.categories}
          initialCategoryId={selectedCategoryId || undefined}
          onClose={() => {
            setShowAddItemModal(false);
            setSelectedCategoryId(null);
          }}
          onCreated={() => {
            setShowAddItemModal(false);
            setSelectedCategoryId(null);
            loadDashboard();
          }}
        />
      )}

      {showCreateCategoryModal && data.goal?.id && (
        <CreateCategoryModal
          goalId={data.goal.id}
          onClose={() => setShowCreateCategoryModal(false)}
          onCreated={() => {
            setShowCreateCategoryModal(false);
            loadDashboard();
          }}
        />
      )}
    </main>
  );
}