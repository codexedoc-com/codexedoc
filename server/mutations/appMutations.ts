"use server";

import {
  createMockGoal,
  createMockItem,
  createMockCategory,
} from "@/server/mockData";

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
    return createMockGoal(userId, {
      title: data.title,
      dailyMinutes: data.dailyMinutes,
      deadline: data.deadline?.toISOString(),
    });
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
    if (!data.areaId) {
      return { success: false, error: "Missing areaId" };
    }

    return createMockItem(userId, data);
  } catch (error) {
    console.error("Error creating item:", error);
    return { success: false, error: "Failed to create item" };
  }
}

// Create a learning area with server action
export async function createLearningAreaAction(goalId: string, name: string) {
  try {
    return createMockCategory(goalId, name);
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}
