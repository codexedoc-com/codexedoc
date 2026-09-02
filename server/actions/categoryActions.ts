"use server";

import { db } from "@/server/db/db";
import { items, learningAreas, reviews } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/getCurrentUser";

export interface CategoryDetail {
  id: string;
  name: string;
  goalId: string;
  createdAt: Date;
  items: Array<{
    id: string;
    prompt: string;
    answer: string;
    type: string;
    difficulty: number | null;
    masteryLevel: string | null;
    createdAt: Date;
  }>;
}

/**
 * Get category with its full list of knowledge items
 */
export async function getCategoryDetailAction(categoryId: string): Promise<CategoryDetail | null> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return null;

    const category = await db.query.learningAreas.findFirst({
      where: eq(learningAreas.id, categoryId),
    });

    if (!category) return null;

    const categoryItems = await db.query.items.findMany({
      where: and(
        eq(items.areaId, categoryId),
        eq(items.userId, user.id)
      ),
      orderBy: (items, { desc }) => [desc(items.createdAt)],
    });

    return {
      ...category,
      items: categoryItems,
    };
  } catch (error) {
    console.error("getCategoryDetailAction error:", error);
    return null;
  }
}

/**
 * Delete a category and its associated items/reviews
 */
export async function deleteCategoryAction(categoryId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, error: "Not authenticated" };

    await db.delete(learningAreas).where(eq(learningAreas.id, categoryId));
    return { success: true };
  } catch (error) {
    console.error("deleteCategoryAction error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

/**
 * Delete a knowledge item and its reviews
 */
export async function deleteItemAction(itemId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, error: "Not authenticated" };

    await db.delete(items).where(and(eq(items.id, itemId), eq(items.userId, user.id)));
    return { success: true };
  } catch (error) {
    console.error("deleteItemAction error:", error);
    return { success: false, error: "Failed to delete item" };
  }
}
