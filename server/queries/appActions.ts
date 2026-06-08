import { db } from "@/server/db/db";
import { users, goals, items, reviews, dailyProgress, learningAreas } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { isValidUUID, DEMO_USER_ID } from "./appAuth";

// Create a goal with server action
export async function createGoalAction(
  userId: string,
  data: {
    title: string;
    dailyMinutes: number;
    deadline?: Date;
  }
) {
  try {
    // Prefer authenticated user from JWT cookie if present
    try {
      const cookieStore = await cookies();
      const token = cookieStore?.get?.("codexedoc_token")?.value;
      if (token) {
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
          if (payload?.userId) {
            userId = payload.userId;
          }
        } catch (e) {
          console.warn("createGoalAction: invalid auth token", e);
        }
      }
    } catch (e) {
      // cookies() may not be available in some contexts; ignore
      console.warn("createGoalAction: failed to read auth cookie", e);
    }

    // Map non-UUIDs to demo user for local dev, but do NOT seed demo data here.
    if (!isValidUUID(userId)) {
      console.warn("createGoalAction: mapping to demo user for user:", userId);
      userId = DEMO_USER_ID;
      try {
        const existingDemo = await db.query.users.findFirst({ where: eq(users.email, "demo@codexedoc.com") });
        if (!existingDemo) {
          await db.insert(users).values({ id: userId, username: "Demo Learner", email: "demo@codexedoc.com" });
        }
      } catch (e) {
        console.error("Error ensuring demo user exists:", e);
      }
    }

    await db.insert(goals).values({
      userId,
      title: data.title,
      dailyMinutes: data.dailyMinutes,
      deadline: data.deadline,
    });

    return { success: true, message: "Goal created successfully" };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: "Failed to create goal" };
  }
}

// Create a knowledge item (client calls this as a server action)
export async function createItemAction(
  userId: string,
  data: {
    areaId: string;
    type: string;
    prompt: string;
    answer: string;
    difficulty?: number;
  }
) {
  try {
    if (!isValidUUID(userId)) {
      console.warn("createItemAction: mapping to demo user for user:", userId);
      userId = DEMO_USER_ID;
    }

    if (!data.areaId) {
      return { success: false, error: "Missing areaId" };
    }

    const inserted = await db.insert(items).values({
      userId,
      areaId: data.areaId,
      type: data.type,
      prompt: data.prompt,
      answer: data.answer,
      difficulty: data.difficulty || 1,
      masteryLevel: 'new',
    });

    // Schedule an initial review for today
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Best-effort insert; some DB drivers don't return inserted id reliably, so look it up by prompt
      const createdItem = await db.query.items.findFirst({ where: eq(items.prompt, data.prompt) });
      if (createdItem?.id) {
        await db.insert(reviews).values({ itemId: createdItem.id, userId, scheduledAt: today });
      }

      // Update or create daily progress
      const existing = await db.query.dailyProgress.findFirst({ where: and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, today)) });
      if (existing) {
        await db.update(dailyProgress).set({ newItemsAdded: (existing.newItemsAdded || 0) + 1 }).where(eq(dailyProgress.id, existing.id));
      } else {
        await db.insert(dailyProgress).values({ userId, date: today, newItemsAdded: 1 });
      }
    } catch (e) {
      console.warn('createItemAction: failed to schedule review or update daily progress', e);
    }

    return { success: true, message: 'Item created' };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

// Create a learning area with server action
export async function createLearningAreaAction(goalId: string, name: string) {
  try {
    await db.insert(learningAreas).values({
      goalId,
      name,
    });

    return { success: true, message: "Category created successfully" };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}
