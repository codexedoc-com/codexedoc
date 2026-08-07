"use server";

import {
  createMockGoal,
  createMockItem,
  createMockCategory,
  updateMockItem,
  deleteMockItem,
} from "@/server/mockData";
import { serverAuth } from "@/lib/auth/gateway/serverAuth";

// Actualizar una tarjeta de conocimiento
export async function updateItemAction(
  itemId: string,
  data: { prompt?: string; answer?: string; type?: string; difficulty?: number; notes?: string; tags?: string[] }
) {
  try {
    const user = await serverAuth.requireUser();
    return updateMockItem(itemId, data);
  } catch (error) {
    console.error("Error al actualizar item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

// Eliminar una tarjeta de conocimiento
export async function deleteItemAction(itemId: string) {
  try {
    const user = await serverAuth.requireUser();
    return deleteMockItem(itemId);
  } catch (error) {
    console.error("Error al eliminar item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

// Create a goal with server action
export async function createGoalAction(
  data: {
    title: string;
    dailyMinutes: number;
    deadline?: Date;
  }
) {
  try {
    const user = await serverAuth.requireUser();

    return createMockGoal(user.id, {
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
  data: {
    areaId: string;
    type: string;
    prompt: string;
    answer: string;
    difficulty?: number;
  }
) {
  try {
    const user = await serverAuth.requireUser();

    if (!data.areaId) {
      return { success: false, error: "Missing areaId" };
    }

    return createMockItem(user.id, data);
  } catch (error) {
    console.error("Error creating item:", error);
    return { success: false, error: "Failed to create item" };
  }
}

// Create a learning area with server action
export async function createLearningAreaAction(goalId: string, name: string) {
  try {
    const user = await serverAuth.requireUser();
    return createMockCategory(goalId, name);
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}
