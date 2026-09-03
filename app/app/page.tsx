import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  getActiveGoal,
  getGoalCategories,
  getTodayProgress,
  getProgressAnalytics,
  getStatistics,
  getSkillTree,
} from "@/server/queries/appQueries";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/auth");
  }

  const goal = await getActiveGoal(user.id);

  if (!goal?.id) {
    redirect(`/create?userId=${user.id}`);
  }

  const [categories, todayStats, progressStats, statistics, skillTree] = await Promise.all([
    getGoalCategories(goal.id),
    getTodayProgress(user.id, ""),
    getProgressAnalytics(user.id, ""),
    getStatistics(user.id),
    getSkillTree(user.id),
  ]);

  return (
    <DashboardClient
      initialData={{
        user: {
          id: user.id,
          username: user.username ?? undefined,
          email: user.email,
        },
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
      }}
    />
  );
}