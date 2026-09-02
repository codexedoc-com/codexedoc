"use server";

import { db } from "@/server/db/db";
import { items, reviews, dailyProgress, studySessions, reflections } from "@/server/db/schema";
import { eq, and, lte, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/getCurrentUser";

export interface ReviewItem {
  id: string;
  itemId: string;
  prompt: string;
  answer: string;
  type: string;
  difficulty: number | null;
  masteryLevel: string | null;
  categoryName: string;
  easeFactor: number | null;
  intervalDays: number | null;
  repetition: number | null;
}

/**
 * Fetch all items due for review today (or all items if in study mode)
 */
export async function fetchDueReviews(userId?: string, areaId?: string): Promise<ReviewItem[]> {
  try {
    const user = await getCurrentUser(userId);
    if (!user?.id) return [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Fetch reviews scheduled for today or earlier
    const userReviews = await db.query.reviews.findMany({
      where: and(
        eq(reviews.userId, user.id),
        lte(reviews.scheduledAt, today)
      ),
      orderBy: [desc(reviews.scheduledAt)],
      limit: 50,
    });

    if (!userReviews || userReviews.length === 0) {
      // If no reviews are strictly due, return items from the user's categories to allow practicing anytime
      const userItems = await db.query.items.findMany({
        where: eq(items.userId, user.id),
        limit: 20,
      });

      return userItems.map((item) => ({
        id: `adhoc-${item.id}`,
        itemId: item.id,
        prompt: item.prompt,
        answer: item.answer,
        type: item.type,
        difficulty: item.difficulty,
        masteryLevel: item.masteryLevel,
        categoryName: "Practice",
        easeFactor: 250,
        intervalDays: 1,
        repetition: 0,
      }));
    }

    const reviewItems: ReviewItem[] = [];

    for (const rev of userReviews) {
      const item = await db.query.items.findFirst({
        where: eq(items.id, rev.itemId),
      });

      if (item) {
        if (areaId && item.areaId !== areaId) continue;

        let categoryName = "General";
        if (item.areaId) {
          const area = await db.query.learningAreas.findFirst({
            where: (areas, { eq }) => eq(areas.id, item.areaId!),
          });
          if (area) categoryName = area.name;
        }

        reviewItems.push({
          id: rev.id,
          itemId: item.id,
          prompt: item.prompt,
          answer: item.answer,
          type: item.type,
          difficulty: item.difficulty,
          masteryLevel: item.masteryLevel,
          categoryName,
          easeFactor: rev.easeFactor,
          intervalDays: rev.intervalDays,
          repetition: rev.repetition,
        });
      }
    }

    return reviewItems;
  } catch (error) {
    console.error("fetchDueReviews error:", error);
    return [];
  }
}

/**
 * SM-2 Algorithm Rating Submission
 * Ratings: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 */
export async function submitCardReviewAction(
  reviewId: string,
  itemId: string,
  rating: number // 1 to 4
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, error: "Not authenticated" };

    // SM-2 calculation
    let easeFactor = 250;
    let intervalDays = 1;
    let repetition = 0;

    const existingReview = reviewId.startsWith("adhoc-")
      ? await db.query.reviews.findFirst({ where: eq(reviews.itemId, itemId) })
      : await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });

    if (existingReview) {
      easeFactor = existingReview.easeFactor || 250;
      intervalDays = existingReview.intervalDays || 1;
      repetition = existingReview.repetition || 0;
    }

    // Quality mapping for SM-2 (1 -> 1, 2 -> 3, 3 -> 4, 4 -> 5)
    const quality = rating === 1 ? 1 : rating === 2 ? 3 : rating === 3 ? 4 : 5;

    if (quality < 3) {
      // Failed recall: reset repetition
      repetition = 0;
      intervalDays = 1;
    } else {
      // Successful recall
      if (repetition === 0) {
        intervalDays = 1;
      } else if (repetition === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * (easeFactor / 100));
      }
      repetition += 1;
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    easeFactor = Math.max(130, Math.round(easeFactor + efDelta * 100));

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    nextDate.setHours(0, 0, 0, 0);

    const now = new Date();

    if (existingReview) {
      await db
        .update(reviews)
        .set({
          easeFactor,
          intervalDays,
          repetition,
          scheduledAt: nextDate,
          lastReviewedAt: now,
        })
        .where(eq(reviews.id, existingReview.id));
    } else {
      await db.insert(reviews).values({
        userId: user.id,
        itemId,
        easeFactor,
        intervalDays,
        repetition,
        scheduledAt: nextDate,
        lastReviewedAt: now,
      });
    }

    // Determine mastery level
    let masteryLevel = "learning";
    if (repetition >= 5) {
      masteryLevel = "mastered";
    } else if (repetition >= 3) {
      masteryLevel = "strong";
    } else if (repetition >= 1) {
      masteryLevel = "familiar";
    }

    await db
      .update(items)
      .set({ masteryLevel })
      .where(eq(items.id, itemId));

    // Update daily progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingProgress = await db.query.dailyProgress.findFirst({
      where: and(eq(dailyProgress.userId, user.id), eq(dailyProgress.date, today)),
    });

    if (existingProgress) {
      await db
        .update(dailyProgress)
        .set({
          reviewsCompleted: (existingProgress.reviewsCompleted || 0) + 1,
        })
        .where(eq(dailyProgress.id, existingProgress.id));
    } else {
      await db.insert(dailyProgress).values({
        userId: user.id,
        date: today,
        reviewsCompleted: 1,
        newItemsAdded: 0,
        minutesStudied: 1,
      });
    }

    return { success: true, nextInterval: intervalDays, masteryLevel };
  } catch (error) {
    console.error("submitCardReviewAction error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

/**
 * Record a completed study session with optional reflection
 */
export async function completeStudySessionAction(
  durationMinutes: number,
  reviewsCount: number,
  reflectionData?: {
    learned?: string;
    difficulty?: string;
    confusion?: string;
    improvement?: string;
    focusTomorrow?: string;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const now = new Date();
    const startedAt = new Date(now.getTime() - durationMinutes * 60 * 1000);

    const [session] = await db
      .insert(studySessions)
      .values({
        userId: user.id,
        durationMinutes: Math.max(1, durationMinutes),
        startedAt,
        endedAt: now,
      })
      .returning();

    if (session && reflectionData && (reflectionData.learned || reflectionData.focusTomorrow)) {
      await db.insert(reflections).values({
        sessionId: session.id,
        userId: user.id,
        learned: reflectionData.learned,
        difficulty: reflectionData.difficulty,
        confusion: reflectionData.confusion,
        improvement: reflectionData.improvement,
        focusTomorrow: reflectionData.focusTomorrow,
      });
    }

    // Update daily progress minutes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingProgress = await db.query.dailyProgress.findFirst({
      where: and(eq(dailyProgress.userId, user.id), eq(dailyProgress.date, today)),
    });

    if (existingProgress) {
      await db
        .update(dailyProgress)
        .set({
          minutesStudied: (existingProgress.minutesStudied || 0) + durationMinutes,
        })
        .where(eq(dailyProgress.id, existingProgress.id));
    } else {
      await db.insert(dailyProgress).values({
        userId: user.id,
        date: today,
        reviewsCompleted: reviewsCount,
        newItemsAdded: 0,
        minutesStudied: durationMinutes,
      });
    }

    return { success: true, sessionId: session?.id };
  } catch (error) {
    console.error("completeStudySessionAction error:", error);
    return { success: false, error: "Failed to record session" };
  }
}
