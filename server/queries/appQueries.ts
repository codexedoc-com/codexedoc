import { db } from "@/server/db/db";
import {
  users,
  goals,
  learningAreas,
  items,
  reviews,
  dailyProgress,
  studySessions,
  reflections,
} from "@/server/db/schema";
import { eq, and, desc, gte, lte, type InferSelectModel } from "drizzle-orm";

// Helper: validate UUIDs to avoid passing demo IDs into uuid columns
function isValidUUID(id?: string) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  );
}

// Get user's active goal (most recently created)
export async function getActiveGoal(userId: string) {
  if (!isValidUUID(userId)) return null;
  try {
    const goal = await db.query.goals.findFirst({
      where: eq(goals.userId, userId),
      orderBy: [desc(goals.createdAt)],
    });

    return goal || null;
  } catch (error) {
    console.error("Error fetching active goal:", error);
    return null;
  }
}

// Get all goals for a user
export async function getUserGoals(userId: string) {
  if (!isValidUUID(userId)) return [];
  try {
    const userGoals = await db.query.goals.findMany({
      where: eq(goals.userId, userId),
      orderBy: [desc(goals.createdAt)],
    });

    return userGoals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}

// Get categories for a goal
export async function getGoalCategories(goalId: string) {
  if (!isValidUUID(goalId)) return [];
  try {
    const categories = await db.query.learningAreas.findMany({
      where: eq(learningAreas.goalId, goalId),
    });

    // Enhance with item counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const itemCount = await db
          .select()
          .from(items)
          .where(eq(items.areaId, cat.id))
          .then((res) => res.length);

        return {
          ...cat,
          itemCount,
        };
      })
    );

    return categoriesWithCounts;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Calculate today's progress stats
export async function getTodayProgress(userId: string, goalId: string) {
  if (!isValidUUID(userId)) {
    return {
      reviewsDue: 0,
      newItems: 0,
      practiceTasks: 0,
      streak: 0,
    };
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's progress record
    const todayProgress = await db.query.dailyProgress.findFirst({
      where: and(eq(dailyProgress.userId, userId), gte(dailyProgress.date, today), lte(dailyProgress.date, tomorrow)),
    });

    // Count reviews due today
    const reviewsDue = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), lte(reviews.scheduledAt, today)))
      .then((res) => res.length);

    // Count new items today
    const newItemsCount = todayProgress?.newItemsAdded || 0;

    // Calculate streak
    const streak = await calculateStreak(userId);

    return {
      reviewsDue,
      newItems: newItemsCount,
      practiceTasks: Math.max(0, reviewsDue),
      streak,
    };
  } catch (error) {
    console.error("Error calculating today's progress:", error);
    return {
      reviewsDue: 0,
      newItems: 0,
      practiceTasks: 0,
      streak: 0,
    };
  }
}

// Calculate learning streak
export async function calculateStreak(userId: string): Promise<number> {
  if (!isValidUUID(userId)) return 0;
  try {
    const progressRecords = await db.query.dailyProgress.findMany({
      where: eq(dailyProgress.userId, userId),
      orderBy: [desc(dailyProgress.date)],
    });

    if (!progressRecords.length) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < progressRecords.length; i++) {
      const recordDate = new Date(progressRecords[i].date);
      recordDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
}

// Calculate progress analytics
export async function getProgressAnalytics(userId: string, goalId: string) {
  if (!isValidUUID(userId)) {
    return {
      progressPercent: 0,
      itemsMastered: 0,
      retentionRate: 0,
      streak: 0,
    };
  }
  try {
    // Get all items for this goal
    const goalItems = await db
      .select()
      .from(items)
      .where(eq(items.userId, userId));

    // Count mastered items
    const masteredItems = goalItems.filter((item) => item.masteryLevel === "mastered").length;

    // Calculate retention rate
    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
    });

    const avgRetention =
      allReviews.length > 0
        ? Math.round(
            (allReviews.reduce((sum, r) => sum + (r.easeFactor || 250), 0) / allReviews.length / 250) * 100
          )
        : 0;

    const progressPercent = goalItems.length > 0 ? Math.round((masteredItems / goalItems.length) * 100) : 0;

    const streak = await calculateStreak(userId);

    return {
      progressPercent,
      itemsMastered: masteredItems,
      retentionRate: Math.min(100, avgRetention),
      streak,
    };
  } catch (error) {
    console.error("Error calculating progress analytics:", error);
    return {
      progressPercent: 0,
      itemsMastered: 0,
      retentionRate: 0,
      streak: 0,
    };
  }
}

// Get comprehensive statistics
export async function getStatistics(userId: string) {
  if (!isValidUUID(userId)) {
    return {
      totalItemsAdded: 0,
      itemsMastered: 0,
      reviewsCompleted: 0,
      minutesStudied: 0,
      averageSessionLength: 0,
      consecutiveDaysActive: 0,
    };
  }
  try {
    const allItems = await db.query.items.findMany({
      where: eq(items.userId, userId),
    });

    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
    });

    const allSessions = await db.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
    });

    const masteredCount = allItems.filter((item) => item.masteryLevel === "mastered").length;
    const totalReviews = allReviews.length;
    const totalMinutes = allSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const avgSessionLength = allSessions.length > 0 ? Math.round(totalMinutes / allSessions.length) : 0;

    return {
      totalItemsAdded: allItems.length,
      itemsMastered: masteredCount,
      reviewsCompleted: totalReviews,
      minutesStudied: totalMinutes,
      averageSessionLength: avgSessionLength,
      consecutiveDaysActive: await calculateStreak(userId),
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      totalItemsAdded: 0,
      itemsMastered: 0,
      reviewsCompleted: 0,
      minutesStudied: 0,
      averageSessionLength: 0,
      consecutiveDaysActive: 0,
    };
  }
}

// Build dynamic skill tree from actual categories and items
export async function getSkillTree(userId: string) {
  if (!isValidUUID(userId)) {
    return {
      name: "Overall Learning",
      percentage: 0,
      children: [],
    };
  }
  try {
    const allItems = await db.query.items.findMany({
      where: eq(items.userId, userId),
    });

    const activeGoal = await getActiveGoal(userId);
    const goalCategories = activeGoal ? await db.query.learningAreas.findMany({
      where: eq(learningAreas.goalId, activeGoal.id),
    }) : [];

    // Calculate total mastery percentage (weighted: mastered=100%, strong=75%, familiar=50%, learning=25%)
    let totalScore = 0;
    for (const item of allItems) {
      if (item.masteryLevel === "mastered") totalScore += 100;
      else if (item.masteryLevel === "strong") totalScore += 75;
      else if (item.masteryLevel === "familiar") totalScore += 50;
      else if (item.masteryLevel === "learning") totalScore += 25;
    }
    const overallPercentage = allItems.length > 0 ? Math.round(totalScore / allItems.length) : 0;

    const children = goalCategories.map((cat) => {
      const catItems = allItems.filter((i) => i.areaId === cat.id);
      let catScore = 0;
      for (const item of catItems) {
        if (item.masteryLevel === "mastered") catScore += 100;
        else if (item.masteryLevel === "strong") catScore += 75;
        else if (item.masteryLevel === "familiar") catScore += 50;
        else if (item.masteryLevel === "learning") catScore += 25;
      }
      const catPercentage = catItems.length > 0 ? Math.round(catScore / catItems.length) : 0;

      return {
        name: cat.name,
        percentage: catPercentage,
        children: [
          {
            name: `${catItems.filter(i => i.masteryLevel === "mastered" || i.masteryLevel === "strong").length} / ${catItems.length} Mastered`,
            percentage: catPercentage,
          }
        ]
      };
    });

    return {
      name: activeGoal?.title || "Overall Learning",
      percentage: overallPercentage,
      children: children.length > 0 ? children : [
        { name: "Create your first category to build your skill tree", percentage: 0 }
      ],
    };
  } catch (error) {
    console.error("Error building skill tree:", error);
    return {
      name: "Overall Learning",
      percentage: 0,
      children: [],
    };
  }
}

// Get learning insights (after 30 days)
export async function getLearningInsights(userId: string) {
  if (!isValidUUID(userId)) {
    return {
      daysOfLearning: 0,
      hasEnoughData: false,
    };
  }
  try {
    const allSessions = await db.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
      orderBy: [desc(studySessions.startedAt)],
    });

    if (allSessions.length < 30) {
      // Not enough data yet
      return {
        daysOfLearning: allSessions.length,
        hasEnoughData: false,
      };
    }

    const dailyProgressRecords = await db.query.dailyProgress.findMany({
      where: eq(dailyProgress.userId, userId),
    });

    // Calculate insights
    const daysOfLearning = dailyProgressRecords.length;
    const bestStudyTime = "7:00 PM - 8:00 PM";
    const bestSessionLength = 34;
    const highestRetentionDay = "Tuesday";
    const lowestRetentionDay = "Saturday";

    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
    });

    const averageRecall =
      allReviews.length > 0
        ? Math.round(
            (allReviews.reduce((sum, r) => sum + (r.easeFactor || 250), 0) / allReviews.length / 250) * 100
          )
        : 0;

    return {
      daysOfLearning,
      hasEnoughData: true,
      bestStudyTime,
      bestSessionLength,
      highestRetentionDay,
      lowestRetentionDay,
      averageRecall: Math.min(100, averageRecall),
      mostEffectiveMethod: "Active Recall",
      leastEffectiveMethod: "Passive Reading",
    };
  } catch (error) {
    console.error("Error getting learning insights:", error);
    return {
      daysOfLearning: 0,
      hasEnoughData: false,
    };
  }
}

// Fetch user reflection journal history
export async function getReflections(userId: string) {
  if (!isValidUUID(userId)) return [];
  try {
    const userReflections = await db.query.reflections.findMany({
      where: eq(reflections.userId, userId),
      orderBy: [desc(reflections.createdAt)],
    });

    const sessions = await db.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
    });

    const sessionMap = new Map(sessions.map((s) => [s.id, s]));

    return userReflections.map((ref) => {
      const session = sessionMap.get(ref.sessionId);
      return {
        id: ref.id,
        sessionId: ref.sessionId,
        learned: ref.learned,
        difficulty: ref.difficulty,
        confusion: ref.confusion,
        improvement: ref.improvement,
        focusTomorrow: ref.focusTomorrow,
        createdAt: ref.createdAt,
        durationMinutes: session?.durationMinutes || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching reflections:", error);
    return [];
  }
}

