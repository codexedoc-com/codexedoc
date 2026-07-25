"use server";

import {
  createMockGoal,
  createMockItem,
  createMockCategory,
  updateMockItem,
  deleteMockItem,
} from "@/server/mockData";

// Actualizar una tarjeta de conocimiento
export async function updateItemAction(
  itemId: string,
  data: { prompt?: string; answer?: string; type?: string; difficulty?: number; notes?: string; tags?: string[] }
) {
  try {
    return updateMockItem(itemId, data);
  } catch (error) {
    console.error("Error al actualizar item:", error);
    return { success: false, error: "Failed to update item" };
  }
}
// Eliminar una tarjeta de conocimiento
export async function deleteItemAction(itemId: string) {
  try {
    return deleteMockItem(itemId);
  } catch (error) {
    console.error("Error al eliminar item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

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
