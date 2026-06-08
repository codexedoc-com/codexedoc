import { db } from "@/server/db/db";
import {
  users,
  goals,
  learningAreas,
  items,
  reviews,
  dailyProgress,
  studySessions,
} from "@/server/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Helper: validate UUIDs to avoid passing demo IDs into uuid columns
function isValidUUID(id?: string) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  );
}

// Demo user ID used for local/demo mode operations. This is a fixed, valid UUID so demo actions
// can create database records without violating FK constraints.
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";


/**
 * DASHBOARD DATA QUERIES
 * ========================
 * Fetch all data needed for the dashboard
 */

// Get current user (will be enhanced with auth)
export async function getCurrentUser(userId?: string) {
  // If no userId provided, try to read from JWT cookie
  if (!userId) {
    try {
      const token = cookies().get("codexedoc_token")?.value;
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
        if (payload?.userId) userId = payload.userId;
      }
    } catch (e) {
      console.warn("getCurrentUser: failed to verify token", e);
    }
  }

  // Demo mode: handle demo user IDs or missing user
  if (!userId || userId.startsWith?.("demo-")) {
    return {
      id: DEMO_USER_ID,
      username: "Demo Learner",
      email: "demo@codexedoc.com",
    };
  }

  // Reject obviously invalid UUIDs to avoid database errors
  if (!isValidUUID(userId)) {
    console.warn("getCurrentUser: invalid UUID provided:", userId);
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
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
async function calculateStreak(userId: string): Promise<number> {
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

// Build skill tree from items
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

    // Group items by type to create skill tree structure
    const skillTree = {
      name: "Overall Learning",
      percentage: calculateMasteryPercentage(allItems),
      children: [
        {
          name: "Speaking",
          percentage: calculateTypePercentage(allItems, ["vocab"]),
          children: [
            { name: "Introductions", percentage: 100 },
            { name: "Questions", percentage: 75 },
            { name: "Opinions", percentage: 20 },
          ],
        },
        {
          name: "Listening",
          percentage: calculateTypePercentage(allItems, ["concept"]),
        },
        {
          name: "Reading",
          percentage: calculateTypePercentage(allItems, ["fact"]),
        },
        {
          name: "Writing",
          percentage: calculateTypePercentage(allItems, ["procedure"]),
        },
      ],
    };

    return skillTree;
  } catch (error) {
    console.error("Error building skill tree:", error);
    return {
      name: "Overall Learning",
      percentage: 0,
      children: [],
    };
  }
}

// Helper functions
function calculateMasteryPercentage(items: any[]): number {
  if (items.length === 0) return 0;
  const masteredCount = items.filter((item) => item.masteryLevel === "mastered").length;
  return Math.round((masteredCount / items.length) * 100);
}

function calculateTypePercentage(items: any[], types: string[]): number {
  const filtered = items.filter((item) => types.includes(item.type));
  if (filtered.length === 0) return 0;
  const masteredCount = filtered.filter((item) => item.masteryLevel === "mastered").length;
  return Math.round((masteredCount / filtered.length) * 100);
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

    const dailyProgress = await db.query.dailyProgress.findMany({
      where: eq(dailyProgress.userId, userId),
    });

    // Calculate insights
    const daysOfLearning = dailyProgress.length;
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

// No mutations in queries file - move to actions/app/mutations.ts
