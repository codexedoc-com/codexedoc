"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Plus,
  Brain,
  Sparkles,
  Layers,
  BookOpen,
  Menu,
  X,
  Compass,
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
import { DocumentUploadModal } from "@/components/DocumentUploadModal";
import { SavedSourcesModal } from "@/components/SavedSourcesModal";

import { logoutAction } from "@/server/actions/auth/logout";
import {
  fetchActiveGoal,
  fetchGoalCategories,
  fetchTodayProgress,
  fetchProgressAnalytics,
  fetchStatistics,
  fetchSkillTree,
} from "@/server/actions/queryActions";

export interface DashboardInitialData {
  user: { id: string; username?: string; email?: string };
  goal: { id: string; title: string; dailyMinutes?: number | null };
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
}

export function DashboardClient({ initialData }: { initialData: DashboardInitialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | undefined>(undefined);
  const [activeCategoryDetailId, setActiveCategoryDetailId] = useState<string | null>(null);

  const [data, setData] = useState<DashboardInitialData>(initialData);

  const refreshDashboard = async () => {
    try {
      const [goal, todayStats, progressStats, statistics, skillTree] = await Promise.all([
        fetchActiveGoal(data.user.id),
        fetchTodayProgress(data.user.id, ""),
        fetchProgressAnalytics(data.user.id, ""),
        fetchStatistics(data.user.id),
        fetchSkillTree(data.user.id),
      ]);

      let categories: DashboardInitialData["categories"] = [];
      if (goal?.id) {
        categories = await fetchGoalCategories(goal.id);
      }

      if (goal) {
        setData({
          user: data.user,
          goal: {
            id: goal.id,
            title: goal.title,
            dailyMinutes: goal.dailyMinutes,
          },
          categories,
          todayStats,
          progressStats,
          statistics,
          skillTree,
        });
      }
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    }
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 pb-24 sm:pb-16 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-3.5 sm:px-6">
          {/* Brand & Goal Pill */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link href="/app" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="relative h-7 w-7 sm:h-8 sm:w-8 overflow-hidden rounded-lg sm:rounded-xl border border-zinc-200/80 bg-white shadow-xs flex-shrink-0">
                <Image
                  src="/codexedoc.png"
                  alt="CODEXEDOC Logo"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <span className="text-sm font-bold tracking-tight text-zinc-900">CODEXEDOC</span>
            </Link>

            {data.goal && (
              <div className="h-4 w-px bg-zinc-200 hidden md:block" />
            )}

            {data.goal && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/60 text-xs font-semibold text-zinc-800 max-w-[220px] truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="truncate">{data.goal.title}</span>
              </div>
            )}
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xs transition cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Auto-Generate</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedCategoryName(undefined);
                setShowStudyModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 shadow-xs transition cursor-pointer active:scale-[0.99]"
            >
              <Brain className="h-3.5 w-3.5 text-indigo-600" />
              <span>Review ({data.todayStats.reviewsDue})</span>
            </button>

            <button
              onClick={() => setShowSourcesModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition cursor-pointer"
              title="View Document Knowledge Base"
            >
              <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
              <span>Documents</span>
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

          {/* Mobile Top Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedCategoryName(undefined);
                setShowStudyModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer"
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Review ({data.todayStats.reviewsDue})</span>
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              title="Open Menu"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Sheet */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-zinc-200 bg-white px-4 py-3 space-y-2 shadow-md">
            {data.goal && (
              <div className="py-2 border-b border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Current Goal</span>
                <p className="text-xs font-semibold text-zinc-900 truncate">{data.goal.title}</p>
              </div>
            )}

            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowUploadModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Auto-Generate from Document/Media</span>
            </button>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowSourcesModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-zinc-500" />
              <span>Document Knowledge Base</span>
            </button>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowAddItemModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 text-zinc-500" />
              <span>Add Knowledge Card</span>
            </button>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                setShowCreateCategoryModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
            >
              <Layers className="h-4 w-4 text-zinc-500" />
              <span>Add Topic Module</span>
            </button>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                router.push(`/create?userId=${data.user.id}`);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
            >
              <Compass className="h-4 w-4 text-zinc-500" />
              <span>Change Learning Goal</span>
            </button>

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="truncate">{data.user.username || data.user.email}</span>
              <button
                onClick={handleLogout}
                className="text-rose-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-3.5 sm:px-6 pt-5 sm:pt-8">
        {/* Goal Hero Banner */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-zinc-500 mb-1">
              <span>Active Goal</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">{data.goal.dailyMinutes || 30} mins daily</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-900 break-words">
              {data.goal.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={() => router.push(`/create?userId=${data.user.id}`)}
              className="flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer text-center"
            >
              Change Goal
            </button>
            <button
              onClick={() => setShowCreateCategoryModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer shadow-xs text-center"
            >
              + New Topic
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Left Column (2 Cols on desktop) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <TodayProgress
              {...data.todayStats}
              onStartReview={() => setShowStudyModal(true)}
            />

            <SessionBreakdown
              dailyMinutes={data.goal.dailyMinutes || 30}
              onStartSession={() => {
                setSelectedCategoryId(null);
                setSelectedCategoryName(undefined);
                setShowStudyModal(true);
              }}
            />

            <CategoriesSection
              categories={data.categories}
              onCreateCategory={() => setShowCreateCategoryModal(true)}
              onSelectCategory={(catId) => setActiveCategoryDetailId(catId)}
            />

            <SkillTree treeData={data.skillTree} />
          </div>

          {/* Right Column (1 Col on desktop) */}
          <div className="space-y-6">
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs space-y-2.5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</p>

              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Sparkles className="h-4 w-4" />
                Auto-Generate from Document/Video
              </button>

              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedCategoryName(undefined);
                  setShowStudyModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold text-sm hover:bg-zinc-50 transition cursor-pointer active:scale-[0.99]"
              >
                <Brain className="h-4 w-4 text-indigo-600" />
                Start Flashcard Session
              </button>

              <button
                onClick={() => setShowAddItemModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold text-sm hover:bg-zinc-50 transition cursor-pointer active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" />
                Add Single Card
              </button>

              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold text-sm hover:bg-zinc-50 transition cursor-pointer active:scale-[0.99]"
              >
                <Layers className="h-4 w-4" />
                Add Topic Module
              </button>

              <button
                onClick={() => setShowSourcesModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition cursor-pointer pt-1"
              >
                <BookOpen className="h-3.5 w-3.5" />
                View Saved Document Sources
              </button>
            </div>

            <ProgressAnalytics {...data.progressStats} />
            <StatsOverview {...data.statistics} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 py-2 px-4 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setSelectedCategoryId(null);
            setSelectedCategoryName(undefined);
            setShowStudyModal(true);
          }}
          className="flex flex-col items-center gap-0.5 text-indigo-600 cursor-pointer"
        >
          <div className="relative">
            <Brain className="h-5 w-5" />
            {data.todayStats.reviewsDue > 0 && (
              <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {data.todayStats.reviewsDue}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Study</span>
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-indigo-600 cursor-pointer"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-medium">AI Generate</span>
        </button>

        <button
          onClick={() => setShowAddItemModal(true)}
          className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-indigo-600 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-medium">Add Card</span>
        </button>

        <button
          onClick={() => setShowSourcesModal(true)}
          className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-indigo-600 cursor-pointer"
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-[10px] font-medium">Sources</span>
        </button>
      </nav>

      {/* Modals */}
      {showUploadModal && data.goal && (
        <DocumentUploadModal
          goalId={data.goal.id}
          goalTitle={data.goal.title}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refreshDashboard();
          }}
        />
      )}

      {showSourcesModal && data.goal && (
        <SavedSourcesModal
          goalId={data.goal.id}
          onClose={() => setShowSourcesModal(false)}
          onRegenerateCards={() => {
            setShowSourcesModal(false);
            refreshDashboard();
          }}
        />
      )}

      {showStudyModal && (
        <StudySessionModal
          userId={data.user.id}
          categoryId={selectedCategoryId || undefined}
          categoryName={selectedCategoryName}
          onClose={() => setShowStudyModal(false)}
          onComplete={() => {
            setShowStudyModal(false);
            refreshDashboard();
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
            refreshDashboard();
          }}
        />
      )}

      {showAddItemModal && (
        <AddItemForm
          userId={data.user.id}
          categories={data.categories}
          initialCategoryId={selectedCategoryId || undefined}
          onClose={() => {
            setShowAddItemModal(false);
            setSelectedCategoryId(null);
          }}
          onCreated={() => {
            setShowAddItemModal(false);
            setSelectedCategoryId(null);
            refreshDashboard();
          }}
        />
      )}

      {showCreateCategoryModal && (
        <CreateCategoryModal
          goalId={data.goal.id}
          onClose={() => setShowCreateCategoryModal(false)}
          onCreated={() => {
            setShowCreateCategoryModal(false);
            refreshDashboard();
          }}
        />
      )}
    </main>
  );
}
